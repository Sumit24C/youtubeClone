import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import { Box, Typography, CircularProgress } from "@mui/material";
import { extractErrorMsg } from "../utils";
import SearchCardContainer from "../components/Main/SearchCardContainer";
import type { Video } from "../types/video";

type SearchResponse = {
    videos: Video[];
    totalPages: number;
};

function SearchVideoPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query") || "";

    const [videos, setVideos] = useState<Video[]>([]);
    const [limit] = useState<number>(9);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const axiosPrivate = useAxiosPrivate();

    const observerRef = useRef<IntersectionObserver | null>(null);

    const fetchVideos = async (pageNum: number): Promise<void> => {
        if (!query) return;

        setLoading(true);
        try {
            const response = await axiosPrivate.get(
                `/videos/search?page=${pageNum}&limit=${limit}&query=${query}`
            );

            const { videos: newVideos, totalPages } = response.data.data;

            setVideos((prev) => [...prev, ...newVideos]);
            setTotalPages(totalPages);
            setPage(pageNum);
        } catch (error: unknown) {
            setErrorMsg(extractErrorMsg(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setVideos([]);
        setPage(1);
        setTotalPages(1);
        setErrorMsg("");

        fetchVideos(1);
    }, [query]);

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
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: 7,
                px: 14,
            }}
        >
            {videos.length > 0 ? (
                videos.map((video) => (
                    <SearchCardContainer key={video._id} video={video} />
                ))
            ) : errorMsg ? (
                <Typography color="error">{errorMsg}</Typography>
            ) : (
                <Typography>No videos available</Typography>
            )}

            {/* 🔥 Scroll anchor */}
            <div id="scroll-anchor" style={{ height: "20px" }} />

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
        </Box>
    );
}

export default SearchVideoPage;