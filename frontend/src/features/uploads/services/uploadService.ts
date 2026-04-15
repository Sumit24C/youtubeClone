import axios from "axios";
import type { Axios, AxiosProgressEvent } from "axios";
import type { UploadChunkParams } from "../types";

export const initMultipartUpload = async (
    api: any,
    file: File,
    videoId: string
) => {
    const res = await api.post("/upload/init-multipart", {
        filename: file.name,
        contentType: file.type,
        videoId,
    });

    return res.data.data;
};

export const getPartUrls = async (
    api: any,
    uploadId: string,
    key: string,
    PartNumber: number
) => {
    const res = await api.post("/upload/get-part-urls", {
        uploadId,
        key,
        PartNumber,
    });

    return res.data.data;
};

export const uploadChunk = async ({
    api,
    item,
    file,
    videoId,
    progressMap,
    controllersMap,
    onProgress,
    isPausedRef,
    retries = 3,
}: UploadChunkParams): Promise<void> => {
    if (isPausedRef?.current) return;

    const controller = new AbortController();
    controllersMap[item.PartNumber] = controller;

    try {
        const res = await axios.put(item.url, item.chunk, {
            signal: controller.signal,
            headers: { "Content-Type": file.type },

            onUploadProgress: (e: AxiosProgressEvent) => {
                progressMap[item.PartNumber] = Math.min(e.loaded, item.chunk.size);

                const totalUploaded = Object.values(progressMap).reduce(
                    (a, b) => a + b,
                    0
                );

                const percent = Math.round((totalUploaded / file.size) * 100);

                if (onProgress) onProgress(percent);
            },
        });

        const rawETag = res.headers["etag"];
        const ETag = rawETag?.replace(/"/g, "");

        await api.post("/upload/save-part", {
            videoId,
            PartNumber: item.PartNumber,
            ETag,
        });
    } catch (err: any) {
        if (axios.isCancel(err)) {
            console.log(`Chunk ${item.PartNumber} cancelled`);
            return;
        }

        if (isPausedRef?.current) return;

        if (retries > 0) {
            console.log(`Retrying chunk ${item.PartNumber}...`);

            return uploadChunk({
                item,
                file,
                videoId,
                api,
                progressMap,
                controllersMap,
                onProgress,
                isPausedRef,
                retries: retries - 1,
            });
        }

        throw err;
    } finally {
        delete controllersMap[item.PartNumber];
    }
};

export const completeUpload = async (api: any, videoId: string) => {
    return api.post("/upload/complete-upload", { videoId });
};

export const abortUpload = async (api: any, {
    videoId,
    uploadId,
    key, 
}: {
    videoId: string,
    uploadId: string,
    key: string
}) => {
    await api.post("/upload/abort-upload", {
        videoId,
        uploadId,
        key
    });
};

export const getUploadStatus = async (api: any, videoId: string) => {
    const res = await api.get(`/upload/upload-status/${videoId}`);
    return res.data.data.uploadedParts;
};

export const saveUploadStatus = async (api: any, {
    videoId,
    PartNumber,
    ETag,
}: {
    videoId: string
    PartNumber: number,
    ETag: string,
}) => {
    const res = await api.post("/upload/save-part", {
        videoId,
        PartNumber: PartNumber,
        ETag,
    });

    return res.data.data;
};

export const createVideoEntry = async (
    api: any,
    {
        title,
        description,
        filename,
        contentType,
    }: {
        title: string,
        description: string,
        filename: string,
        contentType: string,
    }
) => {
    const res = await api.post(`/videos`, {
        title, description, filename, contentType
    });
    return res.data.data;
};

export const uploadThumbnail = async (api: Axios, {
    videoId,
    thumbnail,
    url,
    key
}: {
    videoId: string,
    thumbnail: File,
    url: string,
    key: string
}) => {

    await axios.put(url, thumbnail, {
        headers: { "Content-Type": thumbnail.type },
    });

    await api.patch(`/videos/${videoId}`, {
        thumbnail: key,
    });
}