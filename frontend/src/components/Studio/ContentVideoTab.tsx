import { useState, useEffect } from "react";
import {
    Box,
    CircularProgress,
} from "@mui/material";
import { displayCreatedAt, displayDuration, extractErrorMsg } from "../../utils";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import AnalyticsMenu from "../Buttons/AnalyticsMenu";
import type { Video } from "../../types/video";

function ContentVideoTab() {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [videos, setVideos] = useState<Video[]>([]);

    const axiosPrivate = useAxiosPrivate();

    const tableHeadings = [
        "Video",
        "Status",
        "Visibility",
        "Date",
        "Views",
        "Comments",
        "Likes",
        "Actions",
    ];

    useEffect(() => {
        setLoading(true);
        setErrorMsg("");

        (async () => {
            try {
                const response = await axiosPrivate.get<{ data: Video[] }>(
                    `/dashboard/videos`
                );

                setVideos(response.data.data || []);
            } catch (error: any) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
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
        <div className="w-full">
            <div className="bg-[#1e1e1e] rounded-lg overflow-hidden">
                <table className="w-full text-sm">

                    {/* Header */}
                    <thead className="bg-[#2c2c2c] text-gray-400 uppercase text-xs">
                        <tr>
                            {tableHeadings.map((th, index) => (
                                <th key={index} className="px-4 py-3 text-left font-medium">
                                    {th}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Body */}
                    <tbody>
                        {videos.map((video) => (
                            <tr
                                key={video._id}
                                className="border-b border-[#333] hover:bg-[#1a1a1a]"
                            >
                                {/* Video Info */}
                                <td className="px-4 py-3 min-w-[300px]">
                                    <div className="flex gap-3 items-center">

                                        {/* Thumbnail */}
                                        <div className="relative">
                                            <img
                                                src={video.thumbnailUrl}
                                                alt={video.title}
                                                className="w-[120px] h-[70px] object-cover rounded"
                                            />

                                            {/* Duration */}
                                            <div className="absolute bottom-1 right-1 bg-black/70 text-[10px] px-1 rounded">
                                                {displayDuration(video.duration)}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <div className="max-w-[200px]">
                                            <p className="font-medium truncate">
                                                {video.title}
                                            </p>
                                            <p className="text-gray-400 text-xs truncate">
                                                {video.description || "Add description"}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3 min-w-[120px]">
                                    {video.status === "uploading" && <span>Uploading...</span>}
                                    {video.status === "processing" && <span>Processing...</span>}
                                    {video.status === "ready" && (
                                        <span className="text-green-400">Ready</span>
                                    )}
                                    {video.status === "failed" && (
                                        <span className="text-red-500">Failed</span>
                                    )}
                                </td>

                                {/* Visibility */}
                                <td className="px-4 py-3 min-w-[120px]">
                                    {video.isPublished ? "Public" : "Private"}
                                </td>

                                {/* Date */}
                                <td className="px-4 py-3 min-w-[150px]">
                                    {displayCreatedAt(video.createdAt)}
                                </td>

                                {/* Views */}
                                <td className="px-4 py-3 text-right">
                                    {video.views ?? 0}
                                </td>

                                {/* Comments */}
                                <td className="px-4 py-3 text-right">
                                    {video.comments ?? 0}
                                </td>

                                {/* Likes */}
                                <td className="px-4 py-3 text-right">
                                    {video.likesCount ?? 0}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3 text-right min-w-[100px]">
                                    <AnalyticsMenu
                                        id={video._id}
                                        setContents={setVideos}
                                        type="video"
                                    />
                                </td>
                            </tr>
                        ))}

                        {/* Empty state */}
                        {videos.length === 0 && (
                            <tr>
                                <td colSpan={8} className="py-10 text-center text-gray-400">
                                    No videos found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ContentVideoTab;