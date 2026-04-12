import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    CircularProgress,
} from "@mui/material";
import { displayCreatedAt, displayDuration, extractErrorMsg } from "../../utils";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import AnalyticsMenu from "../Buttons/AnalyticsMenu";

function ContentVideoTab() {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [videos, setVideos] = useState([]);

    const axiosPrivate = useAxiosPrivate();
    const tableHeadings = ["Video", "Status", "Visibility", "Date", "Views", "Comments", "Likes", "Actions"];

    useEffect(() => {
        setLoading(true);
        setErrorMsg("");

        (async function () {
            try {
                const response = await axiosPrivate.get(`/dashboard/videos`);
                setVideos(response.data.data);
            } catch (error) {
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
            {/* Loading */}
            {loading && (
                <div className="p-10 text-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
            )}

            {/* Error */}
            {errorMsg && (
                <div className="p-10 text-center text-red-500">
                    {errorMsg}
                </div>
            )}

            {/* Table */}
            {!loading && !errorMsg && (
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

                                            {/* Title + Desc */}
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
                                        {video.status === "uploading" && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Uploading
                                            </div>
                                        )}

                                        {video.status === "processing" && (
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Processing
                                            </div>
                                        )}

                                        {video.status === "ready" && (
                                            <span className="text-green-400 text-xs">Ready</span>
                                        )}

                                        {video.status === "failed" && (
                                            <span className="text-red-500 text-xs">Failed</span>
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
                                        {video.views.length || 0}
                                    </td>

                                    {/* Comments */}
                                    <td className="px-4 py-3 text-right">
                                        {video.comments.length || 0}
                                    </td>

                                    {/* Likes */}
                                    <td className="px-4 py-3 text-right">
                                        {video.likes.length || "-"}
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
            )}
        </div>
    );
}

export default ContentVideoTab;
