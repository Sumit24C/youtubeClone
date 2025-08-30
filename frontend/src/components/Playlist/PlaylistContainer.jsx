import React, { useState } from "react";
import { Card, CardMedia, CardContent, CardHeader, Typography, Chip, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { displayCreatedAt } from "../../utils";
import MenuButton from "../Buttons/MenuButton";
import PlaylistMenu from "../Buttons/PlaylistMenu";

function PlaylistContainer({ playlist: initialPlaylist, setPlaylistInfo }) {
  const [playlistState, setPlaylistState] = useState(initialPlaylist);

  return (
    <Card sx={{ background: "transparent", color: "white", display: "flex", flexDirection: "column" }}>
      <Box component={Link} to={`/v/${playlistState.lastVideo?._id}/Pl=/${playlistState._id}`} sx={{ textDecoration: "none", color: "inherit" }}>
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            height="176"
            image={playlistState.lastVideo?.thumbnailUrl}
            alt={`${playlistState.name} thumbnail`}
            sx={{ borderRadius: '10px' }}
          />
          <Chip
            label={`${playlistState.videosCount || 0} videos`}
            size="small"
            sx={{ position: "absolute", bottom: 8, right: 8, backgroundColor: "rgba(0,0,0,0.7)", color: "white" }}
          />
        </Box>
      </Box>

      <CardHeader
        title={
          <Typography variant="h6" noWrap sx={{ fontWeight: "bold", color: "white" }}>
            {playlistState.name}
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "gray.400" }}>
            {playlistState.private ? "Private" : "Public"} • Playlist
          </Typography>
        }
        action={
          <PlaylistMenu playlist={playlistState} setPlaylist={setPlaylistState} setPlaylistInfo={setPlaylistInfo}/>
        }
        sx={{ p: 2 }}
      />

      <CardContent sx={{ pt: 0 }}>
        <Typography variant="caption" sx={{ color: "gray.400", display: "block" }}>
          Updated {displayCreatedAt(playlistState.updatedAt)}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PlaylistContainer;
