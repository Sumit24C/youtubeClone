import React from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Avatar,
} from "@mui/material";

function Content() {
  const [tab, setTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const videos = [
    {
      id: 1,
      thumbnail: "https://via.placeholder.com/120x70.png?text=Thumbnail",
      title: "My first video",
      visibility: "Public",
      restrictions: "None",
      date: "Aug 29, 2025",
      views: 0,
      comments: 0,
      likes: "-",
      duration: "1:29",
    },
  ];

  return (
    <Box sx={{ p: 3, bgcolor: "#121212", minHeight: "100vh", color: "white" }}>
      <Typography variant="h5" gutterBottom>
        Channel content
      </Typography>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={handleTabChange}
        textColor="inherit"
        indicatorColor="primary"
        sx={{ borderBottom: "1px solid #333", mb: 2 }}
      >
        <Tab label="Inspiration" />
        <Tab label="Videos" />
        <Tab label="Shorts" />
        <Tab label="Live" />
        <Tab label="Playlists" />
        <Tab label="Podcasts" />
        <Tab label="Promotions" />
      </Tabs>

      {/* Table */}
      <TableContainer component={Paper} sx={{ bgcolor: "#1e1e1e" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "white" }}>
                <Checkbox sx={{ color: "white" }} />
              </TableCell>
              <TableCell sx={{ color: "white" }}>Video</TableCell>
              <TableCell sx={{ color: "white" }}>Visibility</TableCell>
              <TableCell sx={{ color: "white" }}>Restrictions</TableCell>
              <TableCell sx={{ color: "white" }}>Date</TableCell>
              <TableCell sx={{ color: "white" }}>Views</TableCell>
              <TableCell sx={{ color: "white" }}>Comments</TableCell>
              <TableCell sx={{ color: "white" }}>Likes (vs. dislikes)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id} hover>
                <TableCell>
                  <Checkbox sx={{ color: "white" }} />
                </TableCell>
                <TableCell sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      variant="rounded"
                      src={video.thumbnail}
                      alt={video.title}
                      sx={{ width: 120, height: 70, borderRadius: 1 }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.7)",
                        px: 0.5,
                        borderRadius: "4px",
                        fontSize: "12px",
                      }}
                    >
                      {video.duration}
                    </Box>
                  </Box>
                  <Box>
                    <Typography>{video.title}</Typography>
                    <Typography variant="body2" color="gray">
                      Add description
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{video.visibility}</TableCell>
                <TableCell>{video.restrictions}</TableCell>
                <TableCell>{video.date}</TableCell>
                <TableCell>{video.views}</TableCell>
                <TableCell>{video.comments}</TableCell>
                <TableCell>{video.likes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Content;
