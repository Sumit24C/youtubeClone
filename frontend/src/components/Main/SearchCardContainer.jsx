import { Box, Typography, Avatar, CardMedia } from "@mui/material";
import { Link } from "react-router-dom";
import { displayViews, displayDuration, displayCreatedAt } from "../../utils";
import MenuButton from "../Buttons/MenuButton";

function HorizontalVideoCard({
  video,
  size = "large",
  isLiked = false,
  setVideos,
}) {
  const {
    _id,
    thumbnailUrl,
    title,
    channel,
    views = 0,
    createdAt,
    duration,
    description,
  } = video;

  const path = `/v/${_id}`;

  const sizes = {
    large: { width: "470px", height: "250px" },
    medium: { width: "360px", height: "200px" },
  };

  return (
    <Box display="flex" alignItems="flex-start" width="100%">
      {/* Thumbnail Section */}
      <Link
        to={path}
        style={{ textDecoration: "none", flexShrink: 0 }}
      >
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            src={thumbnailUrl}
            alt={title}
            sx={{
              width: sizes[size].width,
              height: sizes[size].height,
              borderRadius: 2,
              objectFit: "cover",
            }}
          />
          {duration && (
            <Box
              sx={{
                position: "absolute",
                bottom: "8px",
                right: "8px",
                bgcolor: "rgba(0,0,0,0.7)",
                color: "#fff",
                px: 0.6,
                py: 0.25,
                borderRadius: "4px",
                fontSize: "0.75rem",
              }}
            >
              {displayDuration(duration)}
            </Box>
          )}
        </Box>
      </Link>

      {/* Right Content Section */}
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        ml={2}
        flex={1}
      >
        {/* Top: Title */}
        <Link to={path} style={{ textDecoration: "none", color: "inherit" }}>
          <Typography
            variant="h6"
            fontSize="1.1rem"
            fontWeight={600}
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.3,
            }}
          >
            {title}
          </Typography>
        </Link>

        {/* Views + Time */}
        <Typography
            fontSize={"0.86rem"}
          variant="body2"
          color="gray"
          sx={{ mt: 0.4, mb: 1 }}
        >
          {displayViews(views)} • {displayCreatedAt(createdAt)}
        </Typography>

        {/* Channel Avatar + Name */}
        {channel && (
          <Link
            to={`/c/${channel[0].username}`}
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "inherit",
              marginBottom: "0.8rem",
            }}
          >
            <Avatar
              src={channel[0].avatar || ""}
              alt={channel[0].username || "unknown"}
              sx={{ width: 28, height: 28, mr: 1 }}
            />
            <Typography
              fontSize="0.90rem"
              fontWeight={500}
              sx={{ color: "gray" }}
            >
              {channel[0].username || "unknown"}
            </Typography>
          </Link>
        )}

        {/* Description */}
        {description && (
          <Typography
            fontSize={"0.8rem"}
            variant="body2"
            color="gray"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      {/* Menu Button (Top-Right) */}
      <Box ml={1}>
        <MenuButton videoId={_id} isLiked={isLiked} setVideos={setVideos} />
      </Box>
    </Box>
  );
}

export default HorizontalVideoCard;
