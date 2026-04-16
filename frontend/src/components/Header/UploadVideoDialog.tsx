import { useEffect, useState } from "react";
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
import { extractErrorMsg } from "../../utils";
import { useNavigate } from "react-router-dom";

import {
    abortUpload,
    completeUpload,
    createVideoEntry,
    getPartUrls,
    getUploadStatus,
    initMultipartUpload,
    uploadThumbnail,
    uploadSubtitle,
    getUploadUrl,
} from "../../services/uploadService";

import Uppy from "@uppy/core";
import type { UppyFile } from "@uppy/core";
import AwsS3, { type AwsBody } from "@uppy/aws-s3";
import { UppyContextProvider, useUppyState } from "@uppy/react";

type FormDataType = {
    title: string;
    description: string;
    image?: FileList;
};

type SubtitleItem = {
    file: File;
    language: string;
};

type UppyMeta = {
    uploadId?: string;
    key?: string;
    videoId?: string;
};

type MultipartInitResponse = {
    uploadId: string;
    videoKey: string;
};

function UploadVideoDialog({
    open,
    handleClose,
}: {
    open: boolean;
    handleClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [_errMsg, setErrMsg] = useState("");
    const [subtitleItems, setSubtitleItems] = useState<SubtitleItem[]>([]);

    const { register, handleSubmit } = useForm<FormDataType>();

    const api = useAxiosPrivate();
    const navigate = useNavigate();

    const [uppy] = useState(() => {
        const instance = new Uppy<UppyMeta, AwsBody>({
            autoProceed: false,
            restrictions: { maxNumberOfFiles: 1 },
        });

        instance.use(AwsS3, {
            shouldUseMultipart: true,

            async createMultipartUpload(file) {
                const meta = file.meta as UppyMeta;
                if (!meta.uploadId || !meta.key) {
                    throw new Error("Missing upload metadata");
                }
                return {
                    uploadId: meta.uploadId,
                    key: meta.key,
                };
            },

            async signPart(_file, { uploadId, key, partNumber }) {
                const url = await getPartUrls(api, uploadId, key, partNumber);
                return {
                    url,
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            _file.type || "application/octet-stream",
                    },
                };
            },

            async completeMultipartUpload(file) {
                const { videoId } = file.meta as UppyMeta;
                if (!videoId) throw new Error("videoId not found");

                await completeUpload(api, videoId);
                navigate("/studio");

                return { location: "" };
            },

            async abortMultipartUpload(file, { uploadId, key }) {
                const { videoId } = file.meta as UppyMeta;
                if (!videoId || !uploadId) {
                    throw new Error("videoId or UploadId not found");
                }

                await abortUpload(api, { videoId, uploadId, key });
            },

            async listParts(file) {
                const { videoId } = file.meta as UppyMeta;
                if (!videoId) throw new Error("videoId not found");

                return await getUploadStatus(api, videoId);
            },

            limit: 6,
        });

        return instance;
    });

    useEffect(() => {
        return () => uppy.destroy();
    }, [uppy]);

    const totalProgress = useUppyState(
        uppy,
        (state) => state.totalProgress
    );

    const status =
        totalProgress === 100
            ? "complete"
            : totalProgress > 0
                ? "uploading"
                : "idle";

    const upload = async (data: FormDataType) => {
        try {
            setLoading(true);

            const file = uppy.getFiles()[0] as
                | UppyFile<UppyMeta, AwsBody>
                | undefined;

            if (!file || !(file.data instanceof File)) {
                throw new Error("No valid video selected");
            }

            const actualFile = file.data;
            const thumbnail = data.image?.[0];

            const videoId = await createVideoEntry(api, {
                title: data.title,
                description: data.description,
                filename: actualFile.name,
                contentType: actualFile.type,
            });

            if (thumbnail) {
                const { url, key } = await getUploadUrl(api, {
                    id: videoId,
                    filename: thumbnail.name,
                    contentType: thumbnail.type,
                    folderName: "thumbnails"
                });

                await uploadThumbnail(api, {
                    videoId,
                    file: thumbnail,
                    url,
                    key,
                });
            }

            if (subtitleItems.some((item) => !item.language)) {
                throw new Error("All subtitles must have a language selected");
            }

            const languages = subtitleItems.map((i) => i.language);
            if (new Set(languages).size !== languages.length) {
                throw new Error("Duplicate subtitle languages not allowed");
            }

            if (subtitleItems.length > 0) {
                await Promise.all(
                    subtitleItems.map(async ({ file, language }) => {
                        const { url, key } = await getUploadUrl(api, {
                            id: videoId,
                            filename: file.name,
                            contentType: file.type,
                            folderName: "subtitles",
                            language,
                        });

                        await uploadSubtitle(api, {
                            videoId,
                            file,
                            url,
                            key,
                            language,
                        });
                    })
                );
            }

            const multipart: MultipartInitResponse = await initMultipartUpload(api, actualFile, videoId);

            uppy.setFileMeta(file.id, {
                uploadId: multipart.uploadId,
                key: multipart.videoKey,
                videoId,
            });

            await uppy.upload();
        } catch (err: unknown) {
            setErrMsg(extractErrorMsg(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <UppyContextProvider uppy={uppy as unknown as Uppy}>
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

                    {/* Video */}
                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            uppy.getFiles().forEach((f) =>
                                uppy.removeFile(f.id)
                            );

                            uppy.addFile({
                                name: file.name,
                                type: file.type,
                                data: file,
                            });
                        }}
                    />

                    {/* Thumbnail */}
                    <input
                        type="file"
                        accept="image/*"
                        {...register("image")}
                    />

                    {/* Subtitles */}
                    <input
                        type="file"
                        accept=".srt,.vtt"
                        multiple
                        onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            const newItems = files.map((file) => ({
                                file,
                                language: "",
                            }));
                            setSubtitleItems((prev) => [
                                ...prev,
                                ...newItems,
                            ]);
                        }}
                    />

                    {subtitleItems.map((item, index) => (
                        <div key={index}>
                            <p>{item.file.name}</p>
                            <select
                                value={item.language}
                                onChange={(e) => {
                                    const updated = [...subtitleItems];
                                    updated[index].language =
                                        e.target.value;
                                    setSubtitleItems(updated);
                                }}
                            >
                                <option value="">Select Language</option>
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="mr">Marathi</option>
                            </select>
                        </div>
                    ))}

                    <div style={{ marginTop: 10 }}>
                        <p>Status: {status}</p>
                        <p>Progress: {totalProgress}%</p>
                    </div>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => uppy.cancelAll()}>
                        Cancel
                    </Button>
                    <Button onClick={() => uppy.pauseAll()}>
                        Pause
                    </Button>
                    <Button onClick={() => uppy.resumeAll()}>
                        Resume
                    </Button>
                    <Button disabled={loading} type="submit">
                        Upload
                    </Button>
                </DialogActions>
            </Dialog>
        </UppyContextProvider>
    );
}

export default UploadVideoDialog;
