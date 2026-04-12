import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import axios, { isCancel } from "axios";
import { extractErrorMsg } from "../../utils";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { uploadChunk } from "../../utils/uploadChunks";

export default function UploadVideoDialog({ open, handleClose }) {
    const [loading, setLoading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const api = useAxiosPrivate();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const isPausedRef = useRef(false);

    useEffect(() => {
        isPausedRef.current = isPaused;
    }, [isPaused]);

    const controllersRef = useRef({});
    const progressMapRef = useRef({});
    const uploadMetaRef = useRef(null);

    const CHUNK_SIZE = 5 * 1024 * 1024;

    const createChunks = (file) => {
        const chunks = [];
        let start = 0;

        while (start < file.size) {
            chunks.push(file.slice(start, start + CHUNK_SIZE));
            start += CHUNK_SIZE;
        }

        return chunks;
    };

    const createVideoEntry = async (data) => {
        try {
            const file = data.image[0];
            const res = await api.post("/videos", {
                title: data.title,
                description: data.description,
                filename: file.name,
                contentType: file.type,
            });

            return res.data.data;
        } catch (error) {
            if (isCancel(error)) {
                console.log("axiosError :: videoUpload :: ", error);
            } else {
                console.log("Error: ", error);
            }
        }
    }

    const initUpload = async (file, videoId) => {
        const chunks = createChunks(file);

        const initRes = await api.post("/upload/init-multipart", {
            filename: file.name,
            contentType: file.type,
            videoId
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
            key: videoKey
        };

        return { chunks, urls, videoId, file };
    };

    const uploadChunks = async (items, file, videoId) => {
        const concurrency = 3;
        let index = 0;

        const workers = Array(concurrency).fill(null).map(async () => {
            while (index < items.length && !isPausedRef.current) {
                const i = index++;
                const { chunk, PartNumber, url } = items[i];
                try {
                    await uploadChunk({
                        chunk,
                        PartNumber,
                        url,
                        file,
                        videoId,
                        api,
                        progressMap: progressMapRef.current,
                        controllersMap: controllersRef.current,
                        onProgress: (percent) => {
                            setProgress(percent);
                        },
                        isPausedRef
                    });
                } catch (err) {
                    console.log("Failed chunk:", PartNumber, err);
                    throw err;
                }
            }
        });

        await Promise.all(workers);
    };

    const completeUpload = async (videoId) => {
        await api.post("/upload/complete-upload", { videoId });
    };

    const pauseUpload = () => {
        setIsPaused(true);
        Object.values(controllersRef.current).forEach((c) => c.abort());
        controllersRef.current = {}
    };

    const resumeUpload = async () => {
        setIsPaused(false);

        const { videoId, chunks, urls, file } = uploadMetaRef.current;
        const statusRes = await api.get(`/upload/upload-status/${videoId}`);
        const uploadedParts = statusRes.data.data.uploadedParts.map(
            (p) => p.PartNumber
        );

        const remaining = chunks
            .map((chunk, i) => ({
                chunk,
                PartNumber: i + 1,
                url: urls[i].url,
            }))
            .filter((item) => !uploadedParts.includes(item.PartNumber));

        if (remaining.length === 0) {
            return;
        }

        await uploadChunks(remaining, file, videoId);
        if (!isPausedRef.current) {
            await completeUpload(videoId);
            console.log("Upload complete");
        }
    };

    const cancelUpload = async () => {
        pauseUpload();
        if (uploadMetaRef.current) {
            await api.post("/upload/abort-upload", uploadMetaRef.current);
            uploadMetaRef.current = null;
        }
        handleClose();
    }

    const upload = async (data) => {
        try {
            setLoading(true);
            progressMapRef.current = {};
            controllersRef.current = {};
            uploadMetaRef.current = null;

            setProgress(0);
            setIsPaused(false);

            const file = data.video[0];
            const thumbnail = data.image[0];
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

            const allItems = chunks.map((chunk, i) => ({
                chunk,
                PartNumber: i + 1,
                url: urls[i].url,
            }));

            await uploadChunks(allItems, file, video.videoId);
            console.log(progress)
            if (!isPausedRef.current) {
                await completeUpload(video.videoId);
                uploadMetaRef.current = null;
            }

            navigate("/studio");
        } catch (err) {
            console.error(err);
            setErrMsg(extractErrorMsg(err));
            if (uploadMetaRef.current) {
                try {
                    await api.post("/upload/abort-upload", uploadMetaRef.current);
                } catch (abortErr) {
                    console.error("Abort failed:", abortErr);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            component={"form"}
            onSubmit={handleSubmit(upload)}
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            disableRestoreFocus
        >
            <DialogTitle>
                Upload Video
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{ position: "absolute", right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <TextField
                    fullWidth
                    margin="normal"
                    label="Video Titles"
                    variant="outlined"
                    error={!!errors.title}
                    helperText={errors?.title?.message}
                    {...register("title", { required: true })}
                />
                <TextField
                    fullWidth
                    margin="normal"
                    label="Description"
                    variant="outlined"
                    multiline
                    error={!!errors.description}
                    helperText={errors?.description?.message}
                    {...register("description", { required: true })}
                    rows={3}
                />
                <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                    Choose Video
                    <input
                        type="file"
                        hidden
                        accept="video/*"
                        {...register("video", { required: true })}
                    />
                </Button>
                <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                    Choose Thumbnail
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        {...register("image", { required: false })}
                    />
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancelUpload}>Cancel</Button>
                <Button
                    disabled={loading}
                    loading={loading}
                    variant="contained"
                    type="submit"
                >
                    Upload
                </Button>

                <Button onClick={pauseUpload} disabled={isPaused}>
                    Pause
                </Button>

                <Button onClick={resumeUpload} disabled={!isPaused}>
                    Resume
                </Button>

                <p>Progress: {progress}%</p>
            </DialogActions>
        </Dialog>
    );
}
