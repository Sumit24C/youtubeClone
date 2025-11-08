import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    IconButton,
    Divider
} from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useParams } from "react-router-dom";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import PlaylistCard from "./PlaylistCard";
import CollapsedContainer from "./CollapsedContainer";

function PlaylistVideo({ isFromLiked }) {
    const { id } = useParams();
    const { p_id } = useParams();
    const axiosPrivate = useAxiosPrivate();
    const [videos, setVideos] = useState(null);
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setLoading(true);
        let url
        (async () => {
            if (isFromLiked) {
                try {
                    const response = await axiosPrivate.get(`/likes/videos`);
                    setPlaylist({ name: "liked Videos" })
                    const likes = response.data.data
                    setVideos(likes.map((l) => l.video));
                } catch (error) {
                    if (!isCancel(error)) console.error(error);
                } finally {
                    setLoading(false);
                }
            } else {
                try {
                    const response = await axiosPrivate.get(`/playlist/${p_id}`);

                    setPlaylist(response.data.data);
                    setVideos(response.data.data.playlistVideo);
                } catch (error) {
                    if (!isCancel(error)) console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        })();

    }, [p_id]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '200px',
                    color: '#fff'
                }}
            >
                Loading...
            </Box>
        );
    }

    if (isCollapsed) {
        return (
            <CollapsedContainer
                videos={videos}
                currentVideo={currentVideo}
                setIsCollapsed={setIsCollapsed}
            />
        );
    }

    return (
        <Box
            sx={{
                border: "1px solid white",
                bgcolor: "#0f0f0f",
                borderRadius: "8px",
                overflow: "hidden",
                width: "98%",
                maxHeight: "600px",
                display: "flex",
                flexDirection: "column"
            }}
        >
            {/* Header with title and controls */}
            <Box sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid #333"
            }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{
                            color: "#fff",
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            lineHeight: 1.3,
                            mb: 0.5
                        }}
                    >
                        {playlist?.name}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                    <IconButton size="small" sx={{ color: "#aaa", "&:hover": { color: "#fff" } }}>
                        <ShuffleIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: "#aaa", "&:hover": { color: "#fff" } }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        sx={{
                            borderRadius: "50%",
                            fontSize: "1rem"
                        }}
                        onClick={() => setIsCollapsed(true)}
                    >
                        X
                    </IconButton>
                </Box>
            </Box>

            {/* Current video indicator */}
            <Box sx={{
                px: 2,
                py: 1,
                bgcolor: "#1a1a1a",
                borderBottom: "1px solid #333"
            }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: "#aaa",
                        fontSize: "0.75rem"
                    }}
                >
                    {currentVideo || 1} / {videos?.length || 0}
                </Typography>
            </Box>

            {/* Video List */}
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                        width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "#1a1a1a",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#555",
                        borderRadius: "3px",
                        "&:hover": {
                            backgroundColor: "#777",
                        },
                    },
                }}
            >
                {videos && videos.length > 0 ? (
                    videos.map((video, index) => (
                        <PlaylistCard
                            key={video._id}
                            p_id={p_id}
                            videoInfo={{ video, index }}
                            setCurrentVideo={setCurrentVideo}
                            isCurrentVideo={id === video._id}
                        />
                    ))
                ) : (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography sx={{ color: "#aaa", fontSize: "0.9rem" }}>
                            No playlist videos available.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default PlaylistVideo;