import { Box, Avatar, Typography, Button } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { useSubscribe } from "../../hooks/useSubscribe";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { removeChannel } from "../../store/channelSlice";
import type { Channel } from "../../types/channel";

function ChannelCard({
    channelInfo,
    setChannels,
}: {
    channelInfo: Channel;
    setChannels?: React.Dispatch<React.SetStateAction<any[]>>;
}) {
    const {
        subscribeLoading,
        handleSubscribe,
        subscribersCount,
    } = useSubscribe({
        ...channelInfo,
        isSubscribed: true,
    });

    const dispatch = useDispatch();

    const { channelData } = useSelector((state: any) => state.channel);

    const handleUnSubscribe = async (
        e: React.MouseEvent<HTMLButtonElement>
    ): Promise<void> => {
        e.preventDefault();
        await handleSubscribe();
        dispatch(removeChannel(channelInfo));
    };

    return (
        <Box
            component={Link}
            to={`/c/${channelInfo.username}`}
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                borderRadius: 2,
                width: "100%",
                maxWidth: "900px",
                mx: "auto",
                textDecoration: "none",
                color: "inherit",
                "&:hover": { bgcolor: "action.hover" },
                gap: 2,
                flexWrap: { xs: "wrap", sm: "nowrap" },
                transition: "background-color 0.2s ease",
            }}
        >
            {/* Left Section */}
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "flex-start",
                    flex: 1,
                }}
            >
                <Avatar
                    src={channelInfo.avatar || ""}
                    alt={channelInfo.username}
                    sx={{
                        width: { xs: 64, sm: 110 },
                        height: { xs: 64, sm: 110 },
                        flexShrink: 0,
                    }}
                />

                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: { xs: "1rem", sm: "1.25rem" },
                        }}
                    >
                        {channelInfo.username}
                        <CheckCircle sx={{ fontSize: 18, color: "gray" }} />
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                    >
                        @{channelInfo.username} •{" "}
                        {channelInfo.subscribersCount} subscribers
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                            maxWidth: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            fontSize: { xs: "0.85rem", sm: "0.95rem" },
                        }}
                    >
                        {channelInfo.description || "No description available"}
                    </Typography>
                </Box>
            </Box>

            {/* Right Section */}
            <Button
                disabled={subscribeLoading}
                onClick={handleUnSubscribe}
                variant="contained"
                sx={{
                    borderRadius: 20,
                    px: 3,
                    py: 0.5,
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: "grey.900",
                    color: "white",
                    "&:hover": { bgcolor: "grey.800" },
                    flexShrink: 0,
                }}
            >
                Subscribed
            </Button>
        </Box>
    );
}

export default ChannelCard;