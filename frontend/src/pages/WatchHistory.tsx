import { useEffect, useState } from "react";
import CardContainer from "../components/Main/CardContainer";
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    Divider,
    Stack,
} from "@mui/material";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import { extractErrorMsg } from "../utils/extractErrorMsg";
import DeleteIcon from "@mui/icons-material/Delete";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { useSelector } from "react-redux";
import type { Video } from "../types/video";
import type { AuthState } from "../types/user";

type RootState = {
    auth: AuthState
};

type ApiResponse<T> = {
    data: T;
};

function WatchHistory() {
    const userData = useSelector(
        (state: RootState) => state.auth.userData
    );

    const axiosPrivate = useAxiosPrivate();

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");

    const [videos, setVideos] = useState<Video[]>([]);

    const [isHistory, setIsHistory] = useState<boolean>(
        userData?.isHistory ?? true
    );

    useEffect(() => {
        const fetchHistory = async (): Promise<void> => {
            setLoading(true);
            setErrorMsg("");

            try {
                const response = await axiosPrivate.get<
                    ApiResponse<Video[]>
                >(`/users/watch-history`);

                setVideos(response.data.data);
            } catch (error: unknown) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [axiosPrivate]);

    const handleClearWatchHistory = async (): Promise<void> => {
        setLoading(true);
        setErrorMsg("");

        try {
            const response = await axiosPrivate.patch<
                ApiResponse<{ cleared: boolean }>
            >(`/users/watch-history`, {});

            if (response.data.data.cleared) {
                setVideos([]);
            }
        } catch (error: unknown) {
            if (!isCancel(error)) {
                setErrorMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePlayPauseWatchHistory = async (): Promise<void> => {
        setLoading(true);
        setErrorMsg("");

        try {
            const response = await axiosPrivate.patch<
                ApiResponse<{ isHistory: boolean }>
            >(`/users/watch-history/p`, {});

            setIsHistory(response.data.data.isHistory);
        } catch (error: unknown) {
            if (!isCancel(error)) {
                setErrorMsg(extractErrorMsg(error));
            }
        } finally {
            setLoading(false);
        }
    };

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
        <Box sx={{ display: "flex", p: 2, gap: 3 }}>
            {/* LEFT */}
            <Box sx={{ flex: 3 }}>
                <Typography variant="h5" fontWeight="bold" mb={2}>
                    Watch history
                </Typography>

                <Divider />

                <Box mt={2} width="70%" marginX={5}>
                    {errorMsg ? (
                        <Typography textAlign="center" color="error">
                            {errorMsg}
                        </Typography>
                    ) : videos.length > 0 ? (
                        videos.map((video) => (
                            <CardContainer
                                key={video._id} 
                                video={video}
                                vertical
                                size="large"
                                history
                                setVideos={setVideos}
                            />
                        ))
                    ) : (
                        <Typography textAlign="center">
                            No videos available
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* RIGHT */}
            <Box sx={{ flex: 1, minWidth: "250px" }}>
                <Stack spacing={2}>
                    <Button
                        startIcon={<DeleteIcon />}
                        sx={{ justifyContent: "flex-start" }}
                        onClick={handleClearWatchHistory}
                        disabled={loading}
                    >
                        Clear all watch history
                    </Button>

                    <Button
                        startIcon={
                            isHistory ? <PauseIcon /> : <PlayArrow />
                        }
                        sx={{ justifyContent: "flex-start" }}
                        onClick={handlePlayPauseWatchHistory}
                        disabled={loading}
                    >
                        {isHistory ? "Pause" : "Play"} watch history
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

export default WatchHistory;