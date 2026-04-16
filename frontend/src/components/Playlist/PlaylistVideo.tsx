import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    IconButton,
} from "@mui/material";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useParams } from "react-router-dom";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import PlaylistCard from "./PlaylistCard";
import CollapsedContainer from "./CollapsedContainer";
import type { Playlist } from "../../types/playlist";
import type { Video } from "../../types/video";

type Props = {
    isFromLiked?: boolean;
};

function PlaylistVideo({ isFromLiked = false }: Props) {
    const { id, p_id } = useParams<{ id: string; p_id: string }>();

    const axiosPrivate = useAxiosPrivate();
    const [videos, setVideos] = useState<Video[]>([]);
    const [playlist, setPlaylist] = useState<Playlist | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentVideo, setCurrentVideo] = useState<number>(1);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

    useEffect(() => {
        if (!isFromLiked && !p_id) return;

        setLoading(true);

        (async () => {
            if (isFromLiked) {
                try {
                    const response = await axiosPrivate.get(`/likes/videos`);

                    const likedVideos = response.data.data;

                    setVideos(likedVideos);

                    setPlaylist({
                        _id: "liked",
                        name: "Liked Videos",
                        owner: "",
                        description: "",
                        isPrivate: false,
                        videosCount: likedVideos.length,
                        updatedAt: new Date().toISOString(),
                        playlistVideos: likedVideos,
                    });

                } catch (error: any) {
                    if (!isCancel(error)) console.error(error);
                } finally {
                    setLoading(false);
                }
            } else {
                try {
                    const response = await axiosPrivate.get(`/playlist/${p_id}`);

                    const playlistData: Playlist = response.data.data;
                    setPlaylist(playlistData);
                    setVideos(playlistData.playlistVideos || []);
                } catch (error: any) {
                    if (!isCancel(error)) console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        })();
    }, [p_id, isFromLiked]);

    if (loading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px",
                    color: "#fff",
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
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    borderBottom: "1px solid #333",
                }}
            >
                <Typography sx={{ color: "#fff", fontWeight: 600 }}>
                    {playlist?.name}
                </Typography>

                <Box sx={{ display: "flex", gap: 0.5 }}>
                    <IconButton size="small" sx={{ color: "#aaa" }}>
                        <ShuffleIcon fontSize="small" />
                    </IconButton>

                    <IconButton size="small" sx={{ color: "#aaa" }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>

                    <IconButton onClick={() => setIsCollapsed(true)}>
                        X
                    </IconButton>
                </Box>
            </Box>

            {/* Current Progress */}
            <Box sx={{ px: 2, py: 1, bgcolor: "#1a1a1a" }}>
                <Typography sx={{ color: "#aaa", fontSize: "0.75rem" }}>
                    {currentVideo} / {videos.length}
                </Typography>
            </Box>

            {/* Video List */}
            <Box sx={{ flex: 1, overflowY: "auto" }}>
                {videos.length > 0 ? (
                    videos.map((video, index) => (
                        <PlaylistCard
                            key={video._id}
                            p_id={p_id!}
                            videoInfo={{ video, index }}
                            setCurrentVideo={setCurrentVideo}
                            isCurrentVideo={id === video._id}
                        />
                    ))
                ) : (
                    <Box sx={{ p: 3, textAlign: "center" }}>
                        <Typography sx={{ color: "#aaa" }}>
                            No playlist videos available.
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default PlaylistVideo;