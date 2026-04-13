import { Box, Typography, Avatar, CardMedia } from "@mui/material";
import { Link } from "react-router-dom";
import MenuButton from "../Buttons/MenuButton";
import {
    displayViews,
    displayDuration,
    displayCreatedAt,
} from "../../utils";
import DeleteVideoWatchHistory from "../Buttons/DeleteVideoWatchHistory";
import type { Video } from "../../types/video";

type Props = {
    p_id?: string;
    video: Video;
    vertical?: boolean;
    size?: "medium" | "large";
    history?: boolean;
    subscribed?: boolean;
    setVideos?: React.Dispatch<React.SetStateAction<Video[]>>;
};

function CardContainer({
    p_id,
    video,
    vertical = false,
    size = "medium",
    history = false,
    setVideos,
}: Props) {
    const {
        _id,
        thumbnailUrl,
        title,
        channel,
        views = 0,
        createdAt,
        duration,
    } = video;
    const path = p_id ? `/v/${_id}/Pl=/${p_id}` : `/v/${_id}`;

    const sizes = {
        medium: { width: "168px", height: "94px" },
        large: { width: "200px", height: "120px" },
    };

    return (
        <Box
            position="relative"
            display={vertical ? "flex" : "block"}
            justifyContent={vertical ? "flex-start" : "initial"}
            alignItems={vertical ? "flex-start" : "initial"}
            width="100%"
            m={1}
        >
            {/* Thumbnail */}
            <Link to={path} style={{ textDecoration: "none", flexShrink: 0 }}>
                <Box sx={{ position: "relative" }}>
                    <CardMedia
                        component="img"
                        src={thumbnailUrl}
                        alt={title}
                        sx={{
                            width: vertical ? sizes[size].width : "100%",
                            height: vertical ? sizes[size].height : 260,
                            borderRadius: 2,
                            objectFit: "cover",
                        }}
                    />

                    {duration && (
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: "10px",
                                right: "5px",
                                bgcolor: "rgba(0,0,0,0.47)",
                                color: "#fff",
                                px: 0.5,
                                py: 0.25,
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                                fontWeight: 500,
                            }}
                        >
                            {displayDuration(duration)}
                        </Box>
                    )}
                </Box>
            </Link>

            {/* Vertical Layout */}
            {vertical ? (
                <Box
                    display="flex"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    width="100%"
                    ml={1}
                >
                    <Box flex={1} minWidth={0} pr={1}>
                        <Link to={path} style={{ textDecoration: "none", color: "inherit" }}>
                            <Typography
                                fontSize="0.95rem"
                                fontWeight={600}
                                sx={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    lineHeight: 1.3,
                                    mb: 0.5,
                                }}
                            >
                                {title}
                            </Typography>
                        </Link>

                        <Typography fontSize="0.95rem" color="gray" noWrap>
                            {channel?.[0]?.username || "unknown"}
                        </Typography>

                        <Typography fontSize="0.8rem" color="gray">
                            {displayViews(views)} • {displayCreatedAt(createdAt)}
                        </Typography>
                    </Box>

                    {history && setVideos && (
                        <DeleteVideoWatchHistory
                            videoId={_id}
                            setVideos={setVideos}
                        />
                    )}

                    <MenuButton videoId={_id} />
                </Box>
            ) : (
                <Box display="flex" alignItems="flex-start" mt={1}>
                    {channel?.[0] && (
                        <Link to={`/c/${channel[0].username}`}>
                            <Avatar
                                src={channel[0].avatar || ""}
                                alt={channel[0].username}
                                sx={{ width: 36, height: 36, mr: 1.5 }}
                            />
                        </Link>
                    )}

                    <Box minWidth={0} flex={1}>
                        <Box display="flex" justifyContent="space-between">
                            <Link
                                to={path}
                                style={{ textDecoration: "none", color: "inherit", flex: 1 }}
                            >
                                <Typography
                                    fontWeight={600}
                                    fontSize="1rem"
                                    sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                    }}
                                >
                                    {title}
                                </Typography>
                            </Link>

                            <MenuButton videoId={_id} />
                        </Box>

                        {channel?.[0] && (
                            <Typography fontSize="0.95rem" color="gray" noWrap>
                                {channel[0].username}
                            </Typography>
                        )}

                        <Typography fontSize="0.9rem" color="gray">
                            {displayViews(views)} • {displayCreatedAt(createdAt)}
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default CardContainer;