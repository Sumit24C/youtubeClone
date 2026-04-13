import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { Box, Typography, CircularProgress } from "@mui/material";
import CardContainer from "../Main/CardContainer";
import PlaylistVideo from "../Playlist/PlaylistVideo";
import { extractErrorMsg } from "../../utils";
import type { Video } from "../../types/video";

type VideosResponse = {
    videos: Video[];
    totalPages: number;
};

function RightContainer() {
    const { id, p_id } = useParams<{ id?: string; p_id?: string }>();

    const [videos, setVideos] = useState<Video[]>([]);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const axiosPrivate = useAxiosPrivate();

    const observerRef = useRef<IntersectionObserver | null>(null);

    const fetchVideos = async (pageNum: number): Promise<void> => {
        setLoading(true);
        try {
            const response = await axiosPrivate.get<{ data: VideosResponse }>(
                `/videos?page=${pageNum}`
            );

            const { videos: newVideos, totalPages } = response.data.data;

            setVideos((prev) => [...prev, ...newVideos]);
            setTotalPages(totalPages);
            setPage(pageNum);
        } catch (error: unknown) {
            if (!isCancel(error)) {
                setErrorMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos(1);
    }, []);

    useEffect(() => {
        if (loading) return;

        if (observerRef.current) observerRef.current.disconnect();

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && page < totalPages) {
                fetchVideos(page + 1);
            }
        });

        const anchor = document.getElementById("scroll-anchor");

        if (anchor) observer.observe(anchor);

        observerRef.current = observer;

        return () => observer.disconnect();
    }, [page, loading, totalPages]);

    if (loading && videos.length === 0) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "60vh",
                    width: "100%",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Playlist section */}
            <Box>
                {p_id &&
                    (p_id === "like" ? (
                        <PlaylistVideo isFromLiked={true} />
                    ) : (
                        <PlaylistVideo />
                    ))}
            </Box>

            {/* Video list */}
            {videos.length > 0 ? (
                videos
                    .filter((video) => p_id || video._id !== id)
                    .map((video) => (
                        <CardContainer key={video._id} video={video} vertical />
                    ))
            ) : (
                <Typography color="gray" textAlign="center">
                    No videos available.
                </Typography>
            )}

            {/* Pagination loader */}
            {loading && videos.length > 0 && (
                <Box
                    sx={{
                        gridColumn: "1 / -1",
                        display: "flex",
                        justifyContent: "center",
                        py: 2,
                    }}
                >
                    <CircularProgress size={30} />
                </Box>
            )}

            <div id="scroll-anchor" />
        </Box>
    );
}

export default RightContainer;