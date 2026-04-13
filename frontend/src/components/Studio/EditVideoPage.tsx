import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { extractErrorMsg } from "../../utils";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import axios, { isCancel } from "axios";
import { useForm } from "react-hook-form";
import VideoPlayer from "../Video/CustomVideoPlayer";
import CreatePlaylist from "../Playlist/CreatePlaylist";
import type { Video } from "../../types/video";

type FormData = {
    title: string;
    description: string;
    isPublished: boolean;
    thumbnail?: FileList;
};

function EditVideoPage() {
    const { id } = useParams<{ id: string }>();
    const api = useAxiosPrivate();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [video, setVideo] = useState<Video | null>(null);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>();

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        setErrorMsg("");

        (async () => {
            try {
                const response = await api.get<{ data: Video }>(
                    `/dashboard/d/${id}`
                );

                const data = response.data.data;
                console.log(data);
                setVideo(data);

                reset({
                    title: data.title,
                    description: data.description,
                    isPublished: data.isPublished ?? true,
                });

            } catch (error: any) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id, api, reset]);

    const onSubmit = async (data: FormData) => {
        if (!video) return;

        try {
            setLoading(true);

            let thumbnailKey = "";

            const file = data.thumbnail?.[0];

            if (file) {
                const res = await api.post<{
                    data: {
                        thumbnail: { url: string; key: string };
                    };
                }>(`upload/pre-signed-url/${video._id}`, {
                    filename: file.name,
                    contentType: file.type,
                });

                const { thumbnail } = res.data.data;

                thumbnailKey = thumbnail.key;

                await axios.put(thumbnail.url, file, {
                    headers: { "Content-Type": file.type },
                });
            }

            await api.patch(`/videos/${id}`, {
                title: data.title,
                description: data.description,
                isPublished: data.isPublished,
                ...(thumbnailKey && { thumbnail: thumbnailKey }),
            });

            navigate(-1);
        } catch (error: any) {
            if (!isCancel(error)) {
                setErrorMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading && !video) {
        return (
            <Box p={4} textAlign="center">
                <CircularProgress />
            </Box>
        );
    }

    if (errorMsg) {
        return (
            <Box p={4} textAlign="center" color="red">
                {errorMsg}
            </Box>
        );
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="min-h-screen bg-[#121212] text-white p-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Video Details</h2>

                {video && (
                    <>
                        <button
                            type="button"
                            onClick={() => setDialogOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
                        >
                            Manage Playlist
                        </button>

                        {dialogOpen && (
                            <div
                                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                                onClick={() => setDialogOpen(false)}
                            >
                                <div
                                    className="bg-[#1e1e1e] rounded-lg overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <CreatePlaylist
                                        videoId={video._id}
                                        handleDialogClose={() => setDialogOpen(false)}
                                        edit
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {video && (
                <>
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* LEFT */}
                        <div className="flex-1 space-y-4">
                            <input
                                {...register("title", { required: "Title is required" })}
                                className="w-full bg-[#1e1e1e] border p-2"
                            />
                            {errors.title && <p>{errors.title.message}</p>}

                            <textarea
                                {...register("description", { required: "Description is required" })}
                                className="w-full bg-[#1e1e1e] border p-2"
                            />

                            <input type="file" {...register("thumbnail")} />

                            <select
                                {...register("isPublished", {
                                    setValueAs: (v) => v === "true",
                                })}
                            >
                                <option value="true">Public</option>
                                <option value="false">Private</option>
                            </select>
                        </div>

                        {/* RIGHT */}
                        <div className="w-full lg:w-[420px]">
                            <div className="aspect-video">
                                <VideoPlayer
                                    videoFile={video.streamUrl || ""}
                                    thumbnail={video.thumbnailUrl || ""}
                                    isEdit
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() =>
                                reset({
                                    title: video.title,
                                    description: video.description,
                                    isPublished: video.isPublished,
                                })
                            }
                        >
                            Undo
                        </button>

                        <button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </>
            )}
        </form>
    );
}

export default EditVideoPage;