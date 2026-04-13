import { useRef, useState } from "react";
import {
    Box,
    Avatar,
    Typography,
    Button,
    IconButton,
    CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useSubscribe } from "../../hooks/useSubscribe";
import VideoPageButton from "../Buttons/VideoPageButton";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";

type Channel = {
    _id: string;
    username: string;
    avatar?: string;
    coverImage?: string;
    description?: string;
    subscribersCount: number;
    videosCount?: number;
    isSubscribed: boolean;
};

const darkTheme = createTheme({
    palette: {
        mode: "dark",
        background: { default: "#0f0f0f" },
        text: { primary: "#fff", secondary: "#aaa" },
    },
});

function ChannelHeader({
    channelInfo,
    fetchChannelInfo,
}: {
    channelInfo: Channel;
    fetchChannelInfo: () => Promise<void>;
}) {
    const {
        coverImage,
        avatar,
        username,
        description = "This is my first video",
        videosCount = 0,
    } = channelInfo;

    const {
        subscribeLoading,
        subscribed,
        subscribersCount,
        handleSubscribe,
    } = useSubscribe(channelInfo);

    const userData = useSelector((state: any) => state.auth.userData);
    const isOwner = userData?.username === username;

    const axiosPrivate = useAxiosPrivate();

    const [avatarLoading, setAvatarLoading] = useState(false);
    const [coverImgLoading, setCoverImgLoading] = useState(false);

    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const coverInputRef = useRef<HTMLInputElement | null>(null);

    const handleAvatarClick = () => avatarInputRef.current?.click();
    const handleCoverClick = () => coverInputRef.current?.click();

    const handleAvatarUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setAvatarLoading(true);

        const file = e.target.files?.[0];
        if (!file) {
            setAvatarLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("avatar", file);

        try {
            await axiosPrivate.patch("/users/update-avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            await fetchChannelInfo();
        } catch (err) {
            console.error(err);
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleCoverUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setCoverImgLoading(true);

        const file = e.target.files?.[0];
        if (!file) {
            setCoverImgLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("coverImage", file);

        try {
            await axiosPrivate.patch("/users/update-coverImage", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            await fetchChannelInfo();
        } catch (err) {
            console.error(err);
        } finally {
            setCoverImgLoading(false);
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            {/* Cover */}
            <Box sx={{ position: "relative", mt: 2 }}>
                {coverImgLoading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Box
                        component="img"
                        src={
                            coverImage ||
                            "https://res.cloudinary.com/youtube236/image/upload/v1754237354/xwd482mt0jae4d5xblr5.png"
                        }
                        sx={{
                            borderRadius: "20px",
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                        }}
                    />
                )}

                {isOwner && (
                    <>
                        <input
                            type="file"
                            hidden
                            ref={coverInputRef}
                            onChange={handleCoverUpload}
                        />
                        <IconButton
                            onClick={handleCoverClick}
                            sx={{
                                position: "absolute",
                                right: 16,
                                bottom: 16,
                                bgcolor: "rgba(0,0,0,0.6)",
                            }}
                        >
                            <CameraAltIcon />
                        </IconButton>
                    </>
                )}
            </Box>

            {/* Avatar */}
            <Box display="flex" gap={3} alignItems="center" py={4}>
                <Box sx={{ position: "relative" }}>
                    {avatarLoading ? (
                        <CircularProgress />
                    ) : (
                        <Avatar src={avatar} sx={{ width: 140, height: 140 }} />
                    )}

                    {isOwner && (
                        <>
                            <input
                                type="file"
                                hidden
                                ref={avatarInputRef}
                                onChange={handleAvatarUpload}
                            />
                            <IconButton
                                onClick={handleAvatarClick}
                                sx={{
                                    position: "absolute",
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: "rgba(0,0,0,0.6)",
                                }}
                            >
                                <CameraAltIcon />
                            </IconButton>
                        </>
                    )}
                </Box>

                {/* Info */}
                <Box flex={1}>
                    <Typography variant="h5" fontWeight="bold">
                        {username} <CheckCircleIcon fontSize="small" />
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        @{username} · {subscribersCount} subscribers · {videosCount} videos
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>

                    <Box mt={3}>
                        {isOwner ? (
                            <Button component={Link} to="/studio" variant="contained">
                                Manage Videos
                            </Button>
                        ) : (
                            <VideoPageButton
                                active={subscribed}
                                onClick={handleSubscribe}
                                loading={subscribeLoading}
                            >
                                {subscribed ? "Subscribed" : "Subscribe"}
                            </VideoPageButton>
                        )}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default ChannelHeader;