import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Visibility, AccessTime, ThumbUp, Comment } from "@mui/icons-material";
import { displayCreatedAt, extractErrorMsg } from "../../utils";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { useParams } from "react-router-dom";
import { isCancel } from "axios";

const VideoAnalytics = () => {
  const { videoId } = useParams();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [video, setVideo] = useState(null);

  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setLoading(true);
    setErrorMsg("");

    const controller = new AbortController();

    (async function () {
      try {
        const response = await axiosPrivate.get(`/dashboard/videos/${videoId}`, {
          signal: controller.signal,
        });
        setVideo(response.data.data); 
      } catch (error) {
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [videoId, axiosPrivate]);

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (errorMsg) {
    return (
      <Box p={4}>
        <Alert severity="error">{errorMsg}</Alert>
      </Box>
    );
  }

  if (!video) return null;

  const { title, createdAt, views = [], likes = [], comments = [] } = video;

  // Derived stats
  const totalViews = views.length;
  const totalWatchTime = views.reduce((sum, v) => sum + v.watchTime, 0);
  const completedViews = views.filter((v) => v.isCompleted).length;
  const totalLikes = likes.length;
  const totalComments = comments.length;

  return (
    <Box p={4}>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Video Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title} • Published {displayCreatedAt(createdAt)}
        </Typography>
      </Box>

      {/* Overview Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Visibility color="primary" />
                <Box>
                  <Typography variant="h6">{totalViews}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Views
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AccessTime sx={{ color: "green" }} />
                <Box>
                  <Typography variant="h6">{totalWatchTime}s</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Watch Time
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ThumbUp sx={{ color: "red" }} />
                <Box>
                  <Typography variant="h6">{totalLikes}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Likes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Comment sx={{ color: "orange" }} />
                <Box>
                  <Typography variant="h6">{totalComments}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Comments
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Engagement details */}
      <Box mt={5}>
        <Typography variant="h6">Engagement</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Completed Views: {completedViews} / {totalViews}
        </Typography>
      </Box>
    </Box>
  );
};

export default VideoAnalytics;
