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
    const tableHeadings = ["Video", "Visibility", "Date", "Views", "Comments", "Likes", "Actions"];

    useEffect(() => {
        setLoading(true);
        setErrorMsg("");

        const controller = new AbortController();

        (async function () {
            try {
                const response = await axiosPrivate.get(`/dashboard/videos`, {
                    signal: controller.signal,
                });
                setVideos(response.data.data);
            } catch (error) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
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
    console.log(videos)
    return (

        <Box>
            {/* Tabs */}
            <TableContainer
                component={Paper}
                sx={{ bgcolor: "#1e1e1e", borderRadius: 2, overflow: "hidden" }}
            >
                <Table>

                    {/* </Table> */}
                    <TableHead>
                        <TableRow sx={{ bgcolor: "#2c2c2c" }}>
                            {tableHeadings.map((th, index) => (
                                <TableCell
                                    key={index}
                                    sx={{
                                        color: "gray",
                                        fontWeight: 500,
                                        textTransform: "uppercase",
                                        fontSize: "12px",
                                    }}
                                >
                                    {th}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {videos.map((video) => (
                            <TableRow
                                key={video._id}
                                hover
                                sx={{
                                    borderBottom: "1px solid #333",
                                    "&:hover": { bgcolor: "#1a1a1a" },
                                }}
                            >
                                {/* Video Info */}
                                <TableCell sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 300 }}>
                                    <Box sx={{ position: "relative" }}>
                                        <Avatar
                                            variant="rounded"
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            sx={{ width: 120, height: 70, borderRadius: 1 }}
                                        />
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                bottom: 4,
                                                right: 4,
                                                bgcolor: "rgba(0,0,0,0.7)",
                                                px: 0.5,
                                                borderRadius: "4px",
                                                fontSize: "12px",
                                            }}
                                        >
                                            {displayDuration(video.duration)}
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontWeight: 500 }}>{video.title}</Typography>
                                        <Typography variant="body2" color="gray" noWrap>
                                            {video.description || "Add description"}
                                        </Typography>
                                    </Box>
                                </TableCell>

                                {/* Visibility */}
                                <TableCell sx={{ minWidth: 120 }}>
                                    {video.isPublished ? "Public" : "Private"}
                                </TableCell>

                                {/* Date */}
                                <TableCell sx={{ minWidth: 150 }}>{displayCreatedAt(video.createdAt)}</TableCell>

                                {/* Views */}
                                <TableCell align="right">{video.views.length || 0}</TableCell>

                                {/* Comments */}
                                <TableCell align="right">{video.comments.length || 0}</TableCell>

                                {/* Likes */}
                                <TableCell align="right">{video.likes.length || "-"}</TableCell>

                                {/* Actions */}
                                <TableCell align="right" sx={{ minWidth: 100 }}>
                                    <AnalyticsMenu id={video._id} setContents={setVideos} type={"video"}/>
                                </TableCell>
                            </TableRow>
                        ))}

                        {videos.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "gray" }}>
                                    No videos found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ContentVideoTab;
