import { useEffect, useState } from "react";
import {
    Box,
    Typography,
    CircularProgress,
    Button,
    CardMedia,
} from "@mui/material";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { useAxiosPrivate } from "../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import { extractErrorMsg } from "../utils/extractErrorMsg";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CardContainer from "../components/Main/CardContainer";
import type { Video } from "../types/video";
import type { AuthState } from "../types/user";
type LikesResponse = {
    data: Video[];
};

type RootState = {
    auth: AuthState
}

function LikedVideos() {
    const userData = useSelector(
        (state: RootState) => state.auth.userData
    );

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const [likedVideos, setLikedVideos] = useState<Video[]>([]);

    useEffect(() => {
        const fetchLikedVideos = async (): Promise<void> => {
            setLoading(true);
            setErrorMsg("");

            try {
                const response = await axiosPrivate.get<LikesResponse>(
                    `/likes/videos`
                );

                const likes = response.data.data;
                console.log(likes);
                setLikedVideos(likes);
            } catch (error: unknown) {
                if (!isCancel(error)) {
                    setErrorMsg(extractErrorMsg(error));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLikedVideos();
    }, [axiosPrivate]);

    if (loading) {
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
                height: "calc(100vh - 64px)",
                bgcolor: "#0f0f0f",
                color: "white",
            }}
        >
            {/* LEFT SIDEBAR */}
            <Box
                sx={{
                    width: 350,
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <CardMedia
                    component="img"
                    image={likedVideos[0]?.thumbnailUrl}
                    sx={{
                        width: "100%",
                        height: 200,
                        borderRadius: 2,
                        mb: 2,
                    }}
                />

                <Typography variant="h5" fontWeight="bold" mb={1}>
                    Liked videos
                </Typography>

                <Typography variant="body2" color="grey.400" mb={1}>
                    {userData?.username}
                </Typography>

                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Button
                        onClick={() =>
                            likedVideos[0] &&
                            navigate(`/v/${likedVideos[0]._id}/Pl=/like`)
                        }
                        variant="contained"
                        startIcon={<PlayArrow />}
                        sx={{
                            borderRadius: 20,
                            bgcolor: "white",
                            color: "black",
                            fontWeight: "bold",
                        }}
                        disabled={likedVideos.length === 0}
                    >
                        Play all
                    </Button>

                    <Typography variant="body2" color="grey.400">
                        {likedVideos.length} videos
                    </Typography>
                </Box>
            </Box>

            {/* RIGHT VIDEO LIST */}
            <Box sx={{ flex: 1, p: 2, overflowY: "auto" }}>
                <Box mt={2} width="70%" marginX={5}>
                    {errorMsg ? (
                        <Typography textAlign="center" color="error">
                            {errorMsg}
                        </Typography>
                    ) : likedVideos.length > 0 ? (
                        likedVideos.map((video) => (
                            <Box key={video._id} my={1}>
                                <CardContainer
                                    video={video}
                                    vertical
                                    size="large"
                                    setVideos={setLikedVideos}
                                />
                            </Box>
                        ))
                    ) : (
                        <Typography textAlign="center">
                            No videos available
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default LikedVideos;