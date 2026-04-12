import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    TextField,
    Typography,
    Card,
    CardMedia,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    CircularProgress,
    Dialog, DialogContent
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { displayCreatedAt, displayDuration, extractErrorMsg } from "../../utils";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import axios, { isCancel } from "axios";
import { useForm } from "react-hook-form";
import VideoPlayer from "../Video/CustomVideoPlayer";
import CreatePlaylist from "../Playlist/CreatePlaylist";

function EditVideoPage() {
    const { id } = useParams();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [video, setVideo] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleDialogClose = () => setDialogOpen(false);
    const handleDialogOpen = () => {
        setDialogOpen(true);
    };

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        reset,
    } = useForm();

    useEffect(() => {
        setLoading(true);
        setErrorMsg("");

        (async function () {
            try {
                const response = await axiosPrivate.get(`/dashboard/d/${id}`);
                setVideo(response.data.data);

                reset({
                    title: response.data.data.title,
                    description: response.data.data.description,
                    // thumbnail: response.data.data.thumbnail,
                    isPublished: response.data.data.isPublished || true,
                });

            } catch (error) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })();

    }, [id, axiosPrivate, reset]);

    const onSubmit = async (data) => {
        try {
            setLoading(true);
            const file = data.thumbnail?.[0];
            let thumbnailKey = "";
            if (file) {
                const res = await axiosPrivate.post(`upload/pre-signed-url/${video._id}`, {
                    filename: file.name,
                    contentType: file.type
                });

                const { thumbnail, videoId } = res.data.data;
                console.log(thumbnail);
                thumbnailKey = thumbnail.key;
                await axios.put(thumbnail.url, file, {
                    headers: { "Content-Type": file.type },
                });
            }

            const response = await axiosPrivate.patch(`/videos/${id}`, {
                title: data.title,
                description: data.description,
                isPublished: data.isPublished,
                thumbnail: thumbnailKey
            });

            navigate(-1);
        } catch (error) {
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
            onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.type !== "textarea") {
                    e.preventDefault();
                }
            }}
            className="min-h-screen bg-[#121212] text-white p-6"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Video Details</h2>

                {video && (
                    <>
                        <button
                            type="button"
                            onClick={handleDialogOpen}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
                        >
                            Manage Playlist
                        </button>

                        {dialogOpen && (
                            <div
                                className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                                onClick={handleDialogClose}
                            >
                                <div className="bg-[#1e1e1e] rounded-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
                                    <CreatePlaylist
                                        videoId={video._id}
                                        handleDialogClose={handleDialogClose}
                                        edit={true}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {video && (
                <>
                    {/* Main Layout */}
                    <div className="flex flex-col lg:flex-row gap-8">

                        {/* LEFT: FORM */}
                        <div className="flex-1 space-y-4">

                            {/* Title */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Title</label>
                                <input
                                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded-md p-2 focus:outline-none focus:border-blue-500"
                                    {...register("title", { required: "Title is required" })}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-sm">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={5}
                                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded-md p-2 focus:outline-none focus:border-blue-500"
                                    {...register("description", {
                                        required: "Description is required",
                                    })}
                                />
                                {errors.description && (
                                    <p className="text-red-500 text-sm">
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            {/* Thumbnail Upload */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">
                                    Upload Thumbnail
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="text-sm"
                                    {...register("thumbnail")}
                                />
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">
                                    Visibility
                                </label>
                                <select
                                    defaultValue={video.isPublished}
                                    className="w-full bg-[#1e1e1e] border border-gray-700 rounded-md p-2"
                                    {...register("isPublished")}
                                >
                                    <option value={true}>Public</option>
                                    <option value={false}>Private</option>
                                </select>
                            </div>
                        </div>

                        {/* RIGHT: VIDEO PREVIEW */}
                        <div className="w-full lg:w-[420px] flex-shrink-0">
                            <div className="bg-[#1e1e1e] rounded-lg overflow-hidden">

                                {/* IMPORTANT: fixed aspect ratio */}
                                <div className="w-full aspect-video">
                                    <VideoPlayer
                                        videoFile={video?.streamUrl}
                                        thumbnail={video?.thumbnailUrl}
                                        isEdit={true}
                                    />
                                </div>

                                <div className="p-2 text-sm text-gray-400">
                                    Preview
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => reset(video)}
                            className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800"
                        >
                            Undo changes
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </>
            )}
        </form>
    );

}

export default EditVideoPage;
