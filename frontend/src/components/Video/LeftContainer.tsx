import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { extractErrorMsg } from "../../utils";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { Box, Typography, Divider } from "@mui/material";
import VideoDetails from "./VideoDetails";
import Comments from "../../pages/Comments";
import CustomVideoPlayer from "./CustomVideoPlayer";
import type { Video } from "../../types/video";

type LeftContainerProps = {
    isWideScreen: boolean;
};

function LeftContainer({ isWideScreen }: LeftContainerProps) {
    const { id } = useParams<{ id: string }>();
    const axiosPrivate = useAxiosPrivate();

    const [video, setVideo] = useState<Video | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!id) return;

        const controller = new AbortController();

        const fetchVideo = async () => {
            setLoading(true);
            try {
                const res = await axiosPrivate.get<{ data: Video }>(
                    `/videos/${id}`,
                    {
                        signal: controller.signal,
                    }
                );

                setVideo(res.data.data);
            } catch (error: unknown) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();

        return () => controller.abort();
    }, [id, axiosPrivate]);

    if (loading && !video) {
        return (
            <Box
                sx={{
                    width: "100%",
                    aspectRatio: "16/9",
                    minHeight: "360px",
                    borderRadius: 2,
                    mx: "auto",
                    background:
                        "radial-gradient(circle, #3a3a3a 15%, #1e1e1e 80%)",
                }}
            />
        );
    }

    if (errorMsg) {
        return (
            <Box textAlign="center" mt={4}>
                <Typography color="error">{errorMsg}</Typography>
            </Box>
        );
    }

    if (!video) return null;

    return (
        <Box sx={{ width: "100%", maxWidth: "900px", mx: "auto" }}>
            <Box mb={1}>
                <CustomVideoPlayer
                    videoFile={video.streamUrl || ""}
                    thumbnail={video.thumbnailUrl}
                />
            </Box>

            {/* Title */}
            <Typography variant="h6" fontWeight="bold" mt={1}>
                {video.title}
            </Typography>

            {/* Details */}
            <VideoDetails
                channel={video.channel?.[0]}
                isLiked={video.isLiked}
                likesCount={video.likesCount}
            />

            <Divider sx={{ my: 2 }} />

            {/* Comments */}
            {isWideScreen && <Comments />}
        </Box>
    );
}

export default LeftContainer;