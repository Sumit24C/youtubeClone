import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box
} from "@mui/material";
import { displayCreatedAt } from "../../utils";
import { Link } from "react-router-dom";

function PlaylistContainer({ playlist }) {
  const {
    _id,
    name,
    lastVideo,
    videosCount,
    updatedAt,
    privacy = "Private"
  } = playlist;

  console.log(_id);
  
  return (
    <Box
      component={Link}
      to={`/v/${lastVideo._id}/Pl=/${_id}`}
      sx={{ textDecoration: 'none' }}
    >
      <Card sx={{ width: 288, backgroundColor: "black", color: "white" }}>
        {/* Thumbnail at top */}
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="176"
            image={
              lastVideo?.thumbnailUrl ||
              "https://res.cloudinary.com/youtube236/image/upload/v1754666950/vzjt10az7ntuzzb08k6n.jpg"
            }
            alt={`${name} thumbnail`}
          />
          {/* Video count badge */}
          <Chip
            label={`${videosCount || 0} videos`}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "white"
            }}
          />
        </Box>

        {/* All text content below thumbnail */}
        <CardContent sx={{ pt: 2 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{ fontWeight: "bold", color: "white", mb: 0.5 }}
          >
            {name}
          </Typography>
          <Typography variant="body2" sx={{ color: "gray.400", mb: 1 }}>
            {privacy} • Playlist
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "gray.400", display: "block", mb: 1 }}
          >
            Updated {displayCreatedAt(updatedAt)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "skyblue", cursor: "pointer" }}
          >
            View full playlist
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default PlaylistContainer;