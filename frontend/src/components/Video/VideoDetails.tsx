import { Link, useParams } from "react-router-dom";
import { Box, Typography, Avatar } from "@mui/material";
import {
    ThumbUpOutlined,
    ThumbUp,
    ThumbDown,
    ThumbDownOutlined,
} from "@mui/icons-material";
import { useSubscribe } from "../../hooks/useSubscribe";
import { useLike } from "../../hooks/useLike";
import VideoPageButton from "../Buttons/VideoPageButton";
import MenuButton from "../Buttons/MenuButton";
import type { Channel } from "../../types/channel";

type VideoDetailsProps = {
    channel: Channel;
    isLiked?: boolean;
    likesCount?: number;
    isDisliked?: boolean;
};

const VideoDetails = ({
    channel,
    isLiked,
    likesCount,
}: VideoDetailsProps) => {
    const { id } = useParams<{ id?: string }>();

    const {
        subscribeLoading,
        subscribed,
        subscribersCount,
        handleSubscribe,
    } = useSubscribe(channel);

    const {
        likeLoading,
        liked,
        countOfLikes,
        // disliked,
        handleLike,
    } = useLike(
        isLiked ?? false,
        likesCount ?? 0,
        "video"
    );

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 0.5,
                flexWrap: "wrap",
                gap: 1.5,
            }}
        >
            {/* Channel Info & Subscribe Button */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Link
                    to={`/c/${channel.username}`}
                    style={{ textDecoration: "none" }}
                >
                    <Avatar
                        src={channel.avatar}
                        alt={channel.username}
                        sx={{ width: 40, height: 40 }}
                    />
                </Link>

                <Box>
                    <Typography
                        component={Link}
                        to={`/c/${channel.username}`}
                        fontSize="1rem"
                        fontWeight={600}
                        color="white"
                        sx={{
                            textDecoration: "none",
                            "&:hover": {
                                textDecoration: "none",
                            },
                        }}
                    >
                        {channel.username}
                    </Typography>

                    <Typography fontSize="0.85rem" fontWeight={500} color="gray">
                        {`${subscribersCount} subscriber${subscribersCount > 1 ? "s" : ""
                            }`}
                    </Typography>
                </Box>

                <VideoPageButton
                    active={subscribed}
                    onClick={handleSubscribe}
                    loading={subscribeLoading}
                >
                    {subscribed ? "Subscribed" : "Subscribe"}
                </VideoPageButton>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* Like / Dislike group */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        bgcolor: "#272727",
                        borderRadius: "18px",
                        height: "36px",
                        overflow: "hidden",
                    }}
                >
                    {/* Like */}
                    <VideoPageButton
                        onClick={handleLike}
                        loading={likeLoading}
                        icon={
                            liked ? (
                                <ThumbUp fontSize="small" sx={{ color: "white" }} />
                            ) : (
                                <ThumbUpOutlined fontSize="small" sx={{ color: "white" }} />
                            )
                        }
                        iconOnly={false}
                        sx={{
                            color: "white",
                            bgcolor: "transparent",
                            "&:hover": {
                                bgcolor: "#565656ff",
                            },
                        }}
                    >
                        {countOfLikes}
                    </VideoPageButton>

                    {/* Divider */}
                    <Box
                        sx={{
                            height: "60%",
                            width: "1px",
                            backgroundColor: "gray",
                        }}
                    />

                    {/* Dislike */}
                    <VideoPageButton
                        icon={
                            false ? (
                                <ThumbDown fontSize="small" sx={{ color: "white" }} />
                            ) : (
                                <ThumbDownOutlined
                                    fontSize="small"
                                    sx={{ color: "white" }}
                                />
                            )
                        }
                        iconOnly
                        sx={{
                            color: false ? "white" : "#ccc",
                            "&:hover": {
                                bgcolor: "#3a3a3a",
                            },
                        }}
                    />
                </Box>

                {/* Menu */}
                <MenuButton videoId={id || ""} />
            </Box>
        </Box>
    );
};

export default VideoDetails;