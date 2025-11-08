import React from 'react';
import {
    Box,
    Avatar,
    Typography,
    Container,
    Button,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useSubscribe } from '../../hooks/useSubscribe';
import VideoPageButton from '../Buttons/VideoPageButton';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#0f0f0f',
        },
        text: {
            primary: '#fff',
            secondary: '#aaa',
        },
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
});

const ChannelHeader = ({ channelInfo }) => {
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

    const userData = useSelector((state) => state.auth.userData);

    return (
        <ThemeProvider theme={darkTheme}>
            {/* Banner */}
            <Box
                component="img"
                src={coverImage || 'https://res.cloudinary.com/youtube236/image/upload/v1754237354/xwd482mt0jae4d5xblr5.png'}
                alt="Banner"
                sx={{
                    borderRadius: "20px",
                    width: "100%",
                    height: "15%",
                    objectFit: 'cover',
                    mt: 2,
                }}
            />

            {/* Channel Info */}
            <Box
                display="flex"
                gap={3}
                alignItems="center"
                py={4}
            >
                {/* Avatar */}
                <Avatar
                    src={avatar}
                    alt={username}
                    sx={{
                        width: 140,
                        height: 140,
                    }}
                />

                {/* Info Section */}
                <Box flex={1}>
                    {/* Username + Verified */}
                    <Typography
                        variant="h5"
                        fontSize="2rem"
                        fontWeight="bold"
                        display="flex"
                        alignItems="center"
                        gap={1}
                    >
                        {username}
                        <CheckCircleIcon fontSize="small" color="action" />
                    </Typography>

                    {/* Handle, subs, videos */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                        mb={1}
                    >
                        @{username} · {subscribersCount} {subscribersCount === 1 ? "subscriber" : "subscribers"} · {videosCount} {videosCount === 1 ? "video" : "videos"}
                    </Typography>

                    {/* Description */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                    >
                        {description} <Box component="span" fontWeight="bold" color="white">...more</Box>
                    </Typography>

                    {/* Subscribe / Manage Button */}
                    <Box mt={3}>
                        {userData.username === username ? (
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
                                    "&:hover": {
                                        backgroundColor: "#3d3d3dff",
                                    },
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
                                    "&:hover": {
                                        backgroundColor: subscribed ? "#505050" : "#b5b5b5ff",
                                    },
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
