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
    saveUploadStatus,
    uploadThumbnail,
} from "../../features/uploads/services/uploadService";

import Uppy from "@uppy/core";
import type { UppyFile } from "@uppy/core";
import AwsS3, { type AwsBody } from "@uppy/aws-s3";
import { UppyContextProvider, useUppyState } from "@uppy/react";

type FormDataType = {
    title: string;
    description: string;
    image?: FileList;
};

type UppyMeta = {
    uploadId?: string;
    key?: string;
    videoId?: string;
};

type VideoResponse = {
    videoId: string;
    thumbnail: {
        url: string;
        key: string;
    };
};

type UploadStatus = {
    PartNumber: number,
    ETag: string
}

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

    const { register, handleSubmit } = useForm<FormDataType>();

    const api = useAxiosPrivate();
    const navigate = useNavigate();

    const [uppy] = useState(() => {
        const instance = new Uppy<UppyMeta, AwsBody>({
            autoProceed: false,
            restrictions: { maxNumberOfFiles: 1 },
        });

        instance.on("s3-multipart:part-uploaded", async (file, data) => {
            const { videoId } = file.meta as UppyMeta;
            if (!videoId) {
                throw new Error("videoId not found");
            }
            console.log(data);
            await saveUploadStatus(api, {
                videoId: videoId,
                PartNumber: data.PartNumber,
                ETag: data.ETag
            });
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
                    url: url,
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            _file.type || "application/octet-stream",
                    },
                };
            },

            async completeMultipartUpload(file) {
                const { videoId } = file.meta as UppyMeta;
                if (!videoId) {
                    throw new Error("videoId not found");
                }
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

            async listParts(file, _opts) {
                const { videoId } = file.meta as UppyMeta;
                if (!videoId) {
                    throw new Error("videoId not found");
                }

                const uploadedParts: UploadStatus[] = await getUploadStatus(api, videoId);

                return uploadedParts;
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

            if (!file) throw new Error("No video selected");

            if (!(file.data instanceof File)) {
                throw new Error("Invalid file");
            }

            const actualFile = file.data;
            const thumbnail = data.image?.[0];
            const video: VideoResponse = await createVideoEntry(api, {
                title: data.title,
                description: data.description,
                filename: actualFile.name,
                contentType: actualFile.type,
            });

            if (thumbnail) {
                await uploadThumbnail(api, {
                    videoId: video.videoId,
                    thumbnail,
                    url: video.thumbnail.url,
                    key: video.thumbnail.key,
                });
            }

            const multipart: MultipartInitResponse = await initMultipartUpload(api, actualFile, video.videoId);

            uppy.setFileMeta(file.id, {
                uploadId: multipart.uploadId,
                key: multipart.videoKey,
                videoId: video.videoId,
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

                    <input
                        type="file"
                        accept="image/*"
                        {...register("image")}
                    />

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