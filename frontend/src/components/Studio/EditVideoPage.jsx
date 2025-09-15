import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Card,
  CardMedia,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog, DialogContent
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { displayCreatedAt, displayDuration, extractErrorMsg } from "../../utils";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import { useForm } from "react-hook-form";
import VideoPlayer from "../Video/CloudinaryPlayer";
import CreatePlaylist from "../Playlist/CreatePlaylist";

function EditVideoPage() {
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [video, setVideo] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClose = () => setDialogOpen(false);
  const handleDialogOpen = () => {
    setDialogOpen(true);
  };
  console.log(video);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    setLoading(true);
    setErrorMsg("");

    const controller = new AbortController();

    (async function () {
      try {
        const response = await axiosPrivate.get(`/dashboard/d/${id}`, {
          signal: controller.signal,
        });
        setVideo(response.data.data);

        reset({
          title: response.data.data.title,
          description: response.data.data.description,
          thumbnail: response.data.data.thumbnail,
          isPublished: response.data.data.isPublished || true,
        });

      } catch (error) {
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id, axiosPrivate, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      if (data.thumbnail?.[0]) {
        formData.append("thumbnail", data.thumbnail[0]);
      }
      formData.append("isPublished", data.isPublished);

      const response = await axiosPrivate.patch(`/videos/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Video updated:", response.data);
      navigate(-1); // go back after save
    } catch (error) {
      if (!isCancel(error)) {
        setErrorMsg(extractErrorMsg(error));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !video) {
    return (
      <Box p={4} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  if (errorMsg) {
    return (
      <Box p={4} textAlign="center" color="red">
        {errorMsg}
      </Box>
    );
  }

  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.type !== "textarea") {
            e.preventDefault();
          }
        }}
        sx={{
          p: 3,
          bgcolor: "#121212",
          color: "white",
          minHeight: "100vh",
        }}
      >
        {/* --- Header: Video details + Playlist --- */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Video Details
          </Typography>

          {video && (
            <>
              <Button
                variant="contained"
                onClick={handleDialogOpen}
                sx={{ textTransform: "none" }}
              >
                Manage Playlist
              </Button>
              <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                disableRestoreFocus
              >
                <DialogContent sx={{ p: 0 }}>
                  <CreatePlaylist
                    videoId={video._id}
                    handleDialogClose={handleDialogClose}
                    edit={true}
                  />
                </DialogContent>
              </Dialog>
            </>
          )}
        </Box>

        {video && (
          <>
            {/* --- Main Grid --- */}
            <Grid container spacing={4}>
              {/* Left Column: Form fields */}
              <Grid item xs={12} md={7}>
                {/* Title */}
                <TextField
                  fullWidth
                  autoFocus
                  label="Title"
                  margin="normal"
                  error={!!errors.title}
                  helperText={errors?.title?.message}
                  InputLabelProps={{ shrink: true, style: { color: "#aaa" } }}
                  InputProps={{ style: { color: "white" } }}
                  {...register("title", { required: "Title is required" })}
                />

                {/* Description */}
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Description"
                  placeholder="Tell viewers about your video..."
                  margin="normal"
                  error={!!errors.description}
                  helperText={errors?.description?.message}
                  InputLabelProps={{ shrink: true, style: { color: "#aaa" } }}
                  InputProps={{ style: { color: "white" } }}
                  {...register("description", {
                    required: "Description is required",
                  })}
                />

                {/* Thumbnail Upload */}
                <Box mt={3}>
                  <Button variant="outlined" component="label">
                    Upload Thumbnail
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      {...register("thumbnail")}
                    />
                  </Button>
                </Box>

                {/* Visibility */}
                <Box mt={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: "#aaa" }}>Visibility</InputLabel>
                    <Select
                      defaultValue={video.isPublished}
                      sx={{ color: "white" }}
                      {...register("isPublished")}
                    >
                      <MenuItem value={true}>Public</MenuItem>
                      <MenuItem value={false}>Private</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>

              {/* Right Column: Video preview */}
              <Grid item xs={12} md={5}>
                <Card sx={{ bgcolor: "#1e1e1e", p: 2 }}>
                  <VideoPlayer
                    videoFile={video?.videoFile}
                    thumbnail={video?.thumbnail}
                    isEdit={true}
                  />
                </Card>
              </Grid>
            </Grid>

            {/* --- Action Buttons --- */}
            <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => reset(video)}
              >
                Undo changes
              </Button>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </>
  );

}

export default EditVideoPage;
