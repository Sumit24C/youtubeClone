import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { extractErrorMsg } from "../../utils";
import CardContainer from "../Main/CardContainer";
import { Box, CircularProgress, Typography } from "@mui/material";
import type { Video } from "../../types/video";

function ChannelVideos() {
    const [videos, setVideos] = useState<Video[] | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const axiosPrivate = useAxiosPrivate();
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id) return;

        setLoading(true);

        (async () => {
            try {
                const response = await axiosPrivate.get(`/videos/c/${id}`);
                setVideos(response.data.data);
            } catch (error: any) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (errorMsg) {
        return (
            <Box display="flex" justifyContent="center" mt={4}>
                <Typography color="error">{errorMsg}</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                p: 2,
                gap: 2,
                minHeight: "300px",
                width: "100%",
            }}
        >
            {videos && videos.length > 0 ? (
                videos.map((video) => (
                    <CardContainer key={video._id} video={video} />
                ))
            ) : (
                <Typography textAlign="center">
                    No videos available
                </Typography>
            )}
        </Box>
    );
}

export default ChannelVideos;