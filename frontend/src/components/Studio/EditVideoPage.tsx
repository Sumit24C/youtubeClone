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
import { UploadCloud, ListVideo, RotateCcw, Save } from "lucide-react";
import { getUploadUrl, uploadToS3 } from "../../services/uploadService";
import { updateVideoDetails } from "../../services/videoService";

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
        watch,
        formState: { errors },
    } = useForm<FormData>();

    const isPublished = watch("isPublished");

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setErrorMsg("");
        (async () => {
            try {
                const response = await api.get<{ data: Video }>(`/dashboard/d/${id}`);
                const data = response.data.data;
                setVideo(data);
                reset({
                    title: data.title,
                    description: data.description,
                    isPublished: data.isPublished ?? true,
                });
            } catch (error: any) {
                if (!isCancel(error)) setErrorMsg(extractErrorMsg(error));
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
                const { url, key } = await getUploadUrl(api, {
                    id: video._id,
                    filename: file.name,
                    contentType: file.type,
                    folderName: "thumbnails",
                });
                thumbnailKey = key;
                await uploadToS3(file, url);
            }

            await updateVideoDetails(api, {
                videoId: video._id,
                title: data.title,
                description: data.description,
                isPublished: data.isPublished,
                thumbnail: thumbnailKey
            })

            navigate(-1);
        } catch (error: any) {
            if (!isCancel(error)) setErrorMsg(extractErrorMsg(error));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !video) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <CircularProgress size={32} sx={{ color: "rgba(255,255,255,0.4)" }} />
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <p className="text-red-400 text-sm">{errorMsg}</p>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="min-h-screen text-white px-6 py-8 max-w-5xl mx-auto"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className="text-[11px] uppercase tracking-widest text-white/30 mb-1">Dashboard</p>
                    <h2 className="text-[17px] font-medium">Video details</h2>
                </div>

                {video && (
                    <>
                        <button
                            type="button"
                            onClick={() => setDialogOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/15 text-white/70 hover:text-white hover:border-white/30 text-sm transition"
                        >
                            <ListVideo size={15} />
                            Manage playlist
                        </button>

                        {dialogOpen && (
                            <div
                                className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
                                onClick={() => setDialogOpen(false)}
                            >
                                <div
                                    className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10"
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

                        {/* LEFT — form fields */}
                        <div className="flex-1 min-w-0 space-y-5">

                            {/* Title */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-white/35 mb-1.5">
                                    Title
                                </label>
                                <input
                                    {...register("title", { required: "Title is required" })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition"
                                />
                                {errors.title && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.title.message}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-white/35 mb-1.5">
                                    Description
                                </label>
                                <textarea
                                    {...register("description", { required: "Description is required" })}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/30 transition resize-none"
                                />
                                {errors.description && (
                                    <p className="mt-1.5 text-xs text-red-400">{errors.description.message}</p>
                                )}
                            </div>

                            {/* Thumbnail */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-white/35 mb-1.5">
                                    Thumbnail
                                </label>
                                <label className="flex items-center gap-3 border border-dashed border-white/15 rounded-lg px-4 py-3 cursor-pointer hover:border-white/25 transition">
                                    <div className="w-8 h-8 bg-white/6 rounded-md flex items-center justify-center flex-shrink-0">
                                        <UploadCloud size={15} className="text-white/40" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-white/60">Upload new thumbnail</p>
                                        <p className="text-xs text-white/25 mt-0.5">PNG, JPG up to 5MB</p>
                                    </div>
                                    <input
                                        type="file"
                                        {...register("thumbnail")}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                </label>
                            </div>

                            {/* Visibility */}
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-white/35 mb-1.5">
                                    Visibility
                                </label>
                                <div className="flex gap-2">
                                    {(["true", "false"] as const).map((val) => {
                                        const isActive = String(isPublished) === val;
                                        const label = val === "true" ? "Public" : "Private";
                                        return (
                                            <label
                                                key={val}
                                                className={`flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border cursor-pointer transition text-sm
                                                    ${isActive
                                                        ? "border-white/40 text-white"
                                                        : "border-white/10 text-white/35 hover:border-white/20"
                                                    }`}
                                            >
                                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center flex-shrink-0 transition
                                                    ${isActive ? "border-white bg-white" : "border-white/25"}`}
                                                >
                                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                                </div>
                                                {label}
                                                <input
                                                    type="radio"
                                                    value={val}
                                                    {...register("isPublished", { setValueAs: (v) => v === "true" })}
                                                    className="hidden"
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — video preview */}
                        <div className="w-full lg:w-[380px] flex-shrink-0">
                            <p className="text-[11px] uppercase tracking-widest text-white/35 mb-2">Preview</p>
                            <div className="rounded-xl overflow-hidden border border-white/8">
                                <VideoPlayer
                                    videoFile={video.streamUrl || ""}
                                    thumbnail={video.thumbnailUrl || ""}
                                    isEdit
                                />
                            </div>

                            {/* Video meta */}
                            <div className="mt-3 p-3.5 bg-white/[0.03] border border-white/7 rounded-lg space-y-2">
                                <p className="text-[11px] text-white/30 uppercase tracking-widest">Video info</p>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40">Status</span>
                                    <span className={video.isPublished ? "text-green-400" : "text-white/40"}>
                                        {video.isPublished ? "Published" : "Private"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/40">Format</span>
                                    <span className="text-white/60">HLS / adaptive</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-white/8 my-7" />

                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => reset({
                                title: video.title,
                                description: video.description,
                                isPublished: video.isPublished,
                            })}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-white/45 hover:text-white/70 hover:border-white/20 text-sm transition"
                        >
                            <RotateCcw size={14} />
                            Undo changes
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Save size={14} />
                            {loading ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </>
            )}
        </form>
    );
}

export default EditVideoPage;