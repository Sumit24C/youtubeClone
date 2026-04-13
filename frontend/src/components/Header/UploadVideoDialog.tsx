import { useEffect, useRef, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import axios, { isCancel } from "axios";
import { extractErrorMsg } from "../../utils";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { uploadChunk } from "../../utils/uploadChunks";

type FormDataType = {
    title: string;
    description: string;
    video: FileList;
    image?: FileList;
};

type UploadMetaRef = {
    uploadId: string;
    videoId: string;
    chunks: Blob[];
    urls: { url: string }[];
    file: File;
    key: string;
};

function UploadVideoDialog({
    open,
    handleClose,
}: {
    open: boolean;
    handleClose: () => void;
}) {
    const [loading, setLoading] = useState<boolean>(false);
    const [errMsg, setErrMsg] = useState<string>("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormDataType>();

    const api = useAxiosPrivate();
    const navigate = useNavigate();

    const [progress, setProgress] = useState<number>(0);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const isPausedRef = useRef<boolean>(false);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    const controllersRef = useRef<Record<number, AbortController>>({});
    const progressMapRef = useRef<Record<number, number>>({});
    const uploadMetaRef = useRef<UploadMetaRef>(null);

    const CHUNK_SIZE = 5 * 1024 * 1024;

    const createChunks = (file: File) => {
        const chunks: Blob[] = [];
        let start = 0;

        while (start < file.size) {
            chunks.push(file.slice(start, start + CHUNK_SIZE));
            start += CHUNK_SIZE;
        }

        return chunks;
    };

    const createVideoEntry = async (data: FormDataType) => {
        const file = data.video[0];

        const res = await api.post("/videos", {
            title: data.title,
            description: data.description,
            filename: file.name,
            contentType: file.type,
        });

        return res.data.data;
    };

    const initUpload = async (file: File, videoId: string) => {
        const chunks = createChunks(file);

        const initRes = await api.post("/upload/init-multipart", {
            filename: file.name,
            contentType: file.type,
            videoId,
        });

        const { uploadId, videoKey } = initRes.data.data;

        const partNumbers = chunks.map((_, i) => i + 1);

        const urlsRes = await api.post("/upload/get-part-urls", {
            uploadId,
            key: videoKey,
            partNumbers,
        });

        const urls = urlsRes.data.data;

        uploadMetaRef.current = {
            uploadId,
            videoId,
            chunks,
            urls,
            file,
            key: videoKey,
        };

        return { chunks, urls };
    };

    const uploadChunks = async (
        items: any[],
        file: File,
        videoId: string
    ) => {
        const concurrency = 3;
        let index = 0;

        const workers = Array(concurrency)
            .fill(null)
            .map(async () => {
                while (index < items.length && !isPausedRef.current) {
                    const i = index++;
                    const { chunk, PartNumber, url } = items[i];

                    await uploadChunk({
                        chunk,
                        PartNumber,
                        url,
                        file,
                        videoId,
                        api,
                        progressMap: progressMapRef.current,
                        controllersMap: controllersRef.current,
                        onProgress: setProgress,
                        isPausedRef,
                    });
                }
            });

        await Promise.all(workers);
    };

    const completeUpload = async (videoId: string) => {
        await api.post("/upload/complete-upload", { videoId });
    };

    const pauseUpload = () => {
        setIsPaused(true);

        Object.values(controllersRef.current).forEach((c) => c.abort());
        controllersRef.current = {};
    };

    const resumeUpload = async () => {
        setIsPaused(false);

        const meta = uploadMetaRef.current;
        if (!meta) return;

        const { videoId, chunks, urls, file } = meta;

        const statusRes = await api.get(`/upload/upload-status/${videoId}`);

        const uploadedParts = statusRes.data.data.uploadedParts.map(
            (p: any) => p.PartNumber
        );

        const remaining = chunks
            .map((chunk: Blob, i: number) => ({
                chunk,
                PartNumber: i + 1,
                url: urls[i].url,
            }))
            .filter((item) => !uploadedParts.includes(item.PartNumber));

        if (remaining.length === 0) return;

        await uploadChunks(remaining, file, videoId);

        if (!isPausedRef.current) {
            await completeUpload(videoId);
        }
    };

    const cancelUpload = async () => {
        pauseUpload();

        if (uploadMetaRef.current) {
            await api.post("/upload/abort-upload", uploadMetaRef.current);
            uploadMetaRef.current = null;
        }

        handleClose();
    };

    const upload = async (data: FormDataType) => {
        try {
            setLoading(true);

            const file = data.video[0];
            const thumbnail = data.image?.[0];

            const video = await createVideoEntry(data);

            if (thumbnail) {
                await axios.put(video.thumbnail.url, thumbnail, {
                    headers: { "Content-Type": thumbnail.type },
                });

                await api.patch(`/videos/${video.videoId}`, {
                    thumbnail: video.thumbnail.key,
                });
            }

            const { chunks, urls } = await initUpload(file, video.videoId);

            const items = chunks.map((chunk, i) => ({
                chunk,
                PartNumber: i + 1,
                url: urls[i].url,
            }));

            await uploadChunks(items, file, video.videoId);

            if (!isPausedRef.current) {
                await completeUpload(video.videoId);
            }

            navigate("/studio");
        } catch (err: any) {
            setErrMsg(extractErrorMsg(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            component="form"
            onSubmit={handleSubmit(upload)}
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                Upload Video
                <IconButton
                    onClick={handleClose}
                    sx={{ position: "absolute", right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <TextField
                    fullWidth
                    label="Title"
                    {...register("title", { required: true })}
                />

                <TextField
                    fullWidth
                    label="Description"
                    multiline
                    {...register("description", { required: true })}
                />

                <input type="file" {...register("video")} />
                <input type="file" {...register("image")} />
            </DialogContent>

            <DialogActions>
                <Button onClick={cancelUpload}>Cancel</Button>

                <Button disabled={loading} type="submit">
                    Upload
                </Button>

                <Button onClick={pauseUpload} disabled={isPaused}>
                    Pause
                </Button>

                <Button onClick={resumeUpload} disabled={!isPaused}>
                    Resume
                </Button>

                <p>{progress}%</p>
            </DialogActions>
        </Dialog>
    );
}

export default UploadVideoDialog;