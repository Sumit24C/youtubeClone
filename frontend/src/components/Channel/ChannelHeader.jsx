import React, { useRef, useState } from 'react';
import { Box, Avatar, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useSubscribe } from '../../hooks/useSubscribe';
import VideoPageButton from '../Buttons/VideoPageButton';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: { default: '#0f0f0f' },
        text: { primary: '#fff', secondary: '#aaa' },
    },
    typography: { fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' },
});

const ChannelHeader = ({ channelInfo, fetchChannelInfo }) => {
    const { coverImage, avatar, username, description = "This is my first video", videosCount = 0 } = channelInfo;
    const { subscribeLoading, subscribed, subscribersCount, handleSubscribe } = useSubscribe(channelInfo);
    const userData = useSelector((state) => state.auth.userData);
    const isOwner = userData?.username === username;

    const axiosPrivate = useAxiosPrivate();
    const [loading, setLoading] = useState(false);
    const [avatarloading, setAvatarLoading] = useState(false);
    const [coverImgloading, setCoverImgLoading] = useState(false);

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const handleAvatarClick = () => avatarInputRef.current?.click();
    const handleCoverClick = () => coverInputRef.current?.click();

    const handleAvatarUpload = async (e) => {
        setAvatarLoading(true);
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("avatar", file);
        try {
            const res = await axiosPrivate.patch("/users/update-avatar", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await fetchChannelInfo();
        } catch (err) {
            console.error(err);
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleCoverUpload = async (e) => {
        setCoverImgLoading(true);
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("coverImage", file);
        try {
            const res = await axiosPrivate.patch("/users/update-coverImage", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            await fetchChannelInfo();
        } catch (err) {
            console.error(err);
        } finally {
            setCoverImgLoading(false);
        }
    };

    // if (loading) {
    //     return (
    //         <Box display="flex" justifyContent="center" mt={4}>
    //             <CircularProgress color="secondary" />
    //         </Box>
    //     );
    // }

    return (
        <ThemeProvider theme={darkTheme}>
            {/* Cover Image */}
            <Box sx={{ position: 'relative', mt: 2 }}>
                {coverImgloading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress color="secondary" />
                    </Box>
                ) : (
                    <Box
                        component="img"
                        src={coverImage || 'https://res.cloudinary.com/youtube236/image/upload/v1754237354/xwd482mt0jae4d5xblr5.png'}
                        alt="Banner"
                        sx={{ borderRadius: "20px", width: "100%", height: 180, objectFit: 'cover' }}
                    />
                )}
                {isOwner && (
                    <>
                        <input
                            type="file"
                            hidden
                            accept="image/*"
                            ref={coverInputRef}
                            onChange={handleCoverUpload}
                        />
                        <IconButton
                            onClick={handleCoverClick}
                            sx={{
                                position: 'absolute',
                                right: 16,
                                bottom: 16,
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: '#fff',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                            }}
                        >
                            <CameraAltIcon />
                        </IconButton>
                    </>
                )}
            </Box>

            {/* Avatar */}
            <Box display="flex" gap={3} alignItems="center" py={4}>
                <Box sx={{ position: 'relative' }}>
                    {avatarloading ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            mt={4}
                        >
                            <CircularProgress color="secondary" />
                        </Box>
                    ) : (
                        <Avatar
                            src={avatar}
                            alt={username}
                            sx={{ width: 140, height: 140 }}
                        />
                    )}
                    {isOwner && (
                        <>
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                ref={avatarInputRef}
                                onChange={handleAvatarUpload}
                            />
                            <IconButton
                                onClick={handleAvatarClick}
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: 'rgba(0,0,0,0.6)',
                                    color: '#fff',
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                                }}
                            >
                                <CameraAltIcon />
                            </IconButton>
                        </>
                    )}
                </Box>

                {/* Channel Info */}
                <Box flex={1}>
                    <Typography variant="h5" fontSize="2rem" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        {username}
                        <CheckCircleIcon fontSize="small" color="action" />
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5} mb={1}>
                        @{username} · {subscribersCount} {subscribersCount === 1 ? "subscriber" : "subscribers"} · {videosCount} {videosCount === 1 ? "video" : "videos"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {channelInfo.description} <Box component="span" fontWeight="bold" color="white">...more</Box>
                    </Typography>

                    <Box mt={3}>
                        {isOwner ? (
                            <Button
                                component={Link}
                                to="/studio"
                                variant="contained"
                                sx={{
                                    backgroundColor: "#515151ff",
                                    color: "#fff",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    borderRadius: "20px",
                                    px: 3,
                                    py: 1,
                                    "&:hover": { backgroundColor: "#3d3d3dff" },
                                }}
                            >
                                Manage Videos
                            </Button>
                        ) : (
                            <VideoPageButton
                                active={subscribed}
                                onClick={handleSubscribe}
                                loading={subscribeLoading}
                                sx={{
                                    backgroundColor: subscribed ? "#303030" : "#ffffffff",
                                    color: subscribed ? "#fff" : "#000",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    borderRadius: "20px",
                                    px: 3,
                                    py: 1,
                                    "&:hover": { backgroundColor: subscribed ? "#505050" : "#b5b5b5ff" },
                                }}
                            >
                                {subscribed ? "Subscribed" : "Subscribe"}
                            </VideoPageButton>
                        )}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default ChannelHeader;
