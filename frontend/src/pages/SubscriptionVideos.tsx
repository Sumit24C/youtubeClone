import { useEffect, useState } from "react";
import CardContainer from "../components/Main/CardContainer";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import {extractErrorMsg} from "../utils/extractErrorMsg";
import type { Video } from "../types/video";

type ApiResponse<T> = {
    data: T;
};

function SubscriptionVideos() {
    const axiosPrivate = useAxiosPrivate();

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [videos, setVideos] = useState<Video[]>([]);

    useEffect(() => {
        const fetchVideos = async (): Promise<void> => {
            setLoading(true);
            setErrorMsg("");

            try {
                const response = await axiosPrivate.get<
                    ApiResponse<Video[]>
                >(`/subscriptions/u/v`);

                const subscribedVideos = response.data.data;

                setVideos(subscribedVideos);
            } catch (error: unknown) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [axiosPrivate]);

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
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                },
                p: 2,
                gap: 2,
                minHeight: "300px",
                width: "100%",
            }}
        >
            {errorMsg ? (
                <Typography color="error">{errorMsg}</Typography>
            ) : videos.length > 0 ? (
                videos.map((video) => (
                    <CardContainer
                        key={video._id}
                        video={video}
                        subscribed={true}
                    />
                ))
            ) : (
                <Typography textAlign="center">
                    No subscribed channel videos available
                </Typography>
            )}
        </Box>
    );
}

export default SubscriptionVideos;