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

function PlaylistCard({ playlist }) {
  const {
    name,
    lastVideo,
    videosCount,
    updatedAt,
    privacy = "Private"
  } = playlist;
  console.log(playlist);
console.log(name);
  return (
    <Card sx={{ width: 288, backgroundColor: "black", color: "white" }}>
      {/* Header with title */}
      <CardHeader
        title={
          <Typography
            variant="h6"
            noWrap
            sx={{ fontWeight: "bold", color: "white" }}
          >
            {name}
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "gray.400" }}>
            {privacy} • Playlist
          </Typography>
        }
        sx={{ pb: 0 }}
      />

      {/* Thumbnail */}
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

      {/* Card Content */}
      <CardContent>
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
  );
}

export default PlaylistCard;
