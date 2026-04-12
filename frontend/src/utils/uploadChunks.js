import axios from "axios";

export const uploadChunk = async ({
    chunk,
    PartNumber,
    url,
    file,
    videoId,
    api,
    progressMap,
    controllersMap,
    onProgress,
    isPausedRef,
    retries = 3,
}) => {
    if (isPausedRef?.current) return;

    const controller = new AbortController();
    controllersMap[PartNumber] = controller;

    try {
        const res = await axios.put(url, chunk, {
            signal: controller.signal,
            headers: { "Content-Type": file.type },

            onUploadProgress: (e) => {
                progressMap[PartNumber] = Math.min(e.loaded, chunk.size);

                const totalUploaded = Object.values(progressMap).reduce(
                    (a, b) => a + b,
                    0
                );

                const percent = Math.round((totalUploaded / file.size) * 100);
                console.log(percent);
                if (onProgress) onProgress(percent);
            },
        });

        const rawETag = res.headers["etag"];
        const ETag = rawETag?.replace(/"/g, "");

        await api.post("/upload/save-part", {
            videoId,
            PartNumber,
            ETag,
        });

    } catch (err) {
        if (axios.isCancel(err)) {
            console.log(`Chunk ${PartNumber} cancelled`);
            return;
        }

        if (isPausedRef?.current) return;

        if (retries > 0) {
            console.log(`Retrying chunk ${PartNumber}...`);

            return uploadChunk({
                chunk,
                PartNumber,
                url,
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
        delete controllersMap[PartNumber];
    }
};