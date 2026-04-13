import { Box, Typography } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { displayDuration } from "../../utils";
import MenuButton from "../Buttons/MenuButton";
import { useEffect } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import type { Video } from "../../types/video";

type VideoInfo = {
    video: Video;
    index: number;
};

type Props = {
    p_id: string;
    videoInfo: VideoInfo;
    setCurrentVideo: React.Dispatch<React.SetStateAction<number>>;
    isCurrentVideo: boolean;
};

function PlaylistCard({
    p_id,
    videoInfo,
    setCurrentVideo,
    isCurrentVideo,
}: Props) {
    const {
        _id,
        thumbnailUrl,
        title,
        channel,
        duration,
    } = videoInfo.video;

    const path = `/v/${_id}/Pl=/${p_id}`;
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (id === _id) {
            setCurrentVideo(videoInfo.index + 1);
        }
    }, [id, _id, setCurrentVideo, videoInfo.index]);

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                bgcolor: isCurrentVideo
                    ? "rgba(187, 5, 5, 0.37)"
                    : "transparent",
                "&:hover": {
                    bgcolor: isCurrentVideo
                        ? "rgba(182, 0, 0, 0.3)"
                        : "#1a1a1a",
                    cursor: "pointer",
                },
                transition: "all 0.2s ease",
            }}
        >
            {/* Index / Play */}
            <Box
                sx={{
                    width: "20px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: isCurrentVideo ? "#fff" : "#aaa",
                }}
            >
                {isCurrentVideo ? (
                    <PlayArrowIcon sx={{ fontSize: "16px" }} />
                ) : (
                    <Typography sx={{ fontSize: "0.8rem" }}>
                        {videoInfo.index + 1}
                    </Typography>
                )}
            </Box>

            {/* Thumbnail */}
            <Link to={path} style={{ flexShrink: 0 }}>
                <Box sx={{ position: "relative" }}>
                    <Box
                        component="img"
                        src={thumbnailUrl}
                        alt={title}
                        sx={{
                            width: "120px",
                            height: "68px",
                            borderRadius: 1,
                            objectFit: "cover",
                        }}
                    />

                    {duration && (
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: "8px",
                                right: "4px",
                                bgcolor: "rgba(0,0,0,0.47)",
                                color: "#fff",
                                px: 0.5,
                                py: 0.25,
                                borderRadius: "4px",
                                fontSize: "0.7rem",
                            }}
                        >
                            {displayDuration(duration)}
                        </Box>
                    )}
                </Box>
            </Link>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                <Link to={path}>
                    <Typography
                        sx={{
                            fontSize: "0.85rem",
                            fontWeight: 500,
                            color: "#fff",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {title}
                    </Typography>
                </Link>

                <Typography
                    sx={{
                        fontSize: "0.75rem",
                        color: "#aaa",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {channel?.[0]?.username || "Unknown"}
                </Typography>
            </Box>

            {/* Menu */}
            <Box flexShrink={0}>
                <MenuButton videoId={_id} />
            </Box>
        </Box>
    );
}

export default PlaylistCard;