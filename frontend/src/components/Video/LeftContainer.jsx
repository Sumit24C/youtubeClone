import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { extractErrorMsg } from "../../utils/index.js";
import { isCancel } from "axios";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate.js";
import { Box, Typography, Divider } from "@mui/material";
import VideoDetails from "./VideoDetails.jsx";
import Comments from "../../pages/Comments.jsx";
import CustomVideoPlayer from "./CustomVideoPlayer.jsx";

function LeftContainer({ isWideScreen }) {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const response = await axiosPrivate.get(`/videos/${id}`);
        setVideo(response.data.data);
      } catch (error) {
        if (isCancel(error)) {
          console.error("LeftMain :: error :: ", error);
        } else {
          console.error(error);
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id, axiosPrivate]);

  if (loading && !video) {
    return (
      <Box
        sx={{
          width: "100%",
          aspectRatio: "16/9",
          minHeight: "360px",
          minWidth: "360px",
          borderRadius: 2,
          overflow: "hidden",
          mx: "auto",
          background: "radial-gradient(circle, #3a3a3a 15%, #1e1e1e 80%)",
        }}
      />
    );
  }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          maxWidth: "900px",
          mx: "auto",
        }}
      >
        {video && (
          <Box>
            <Box
              sx={{
                width: "100%",
                mb: 1,
              }}
            >
              <CustomVideoPlayer
                videoFile={video.streamUrl}
                thumbnail={video.thumbnailUrl}
              />
            </Box>

            <Typography variant="h6" fontWeight={"bold"} mt={1}>
              {video.title}
            </Typography>

            <Box>
              <VideoDetails
                channel={video.channel?.[0]}
                isLiked={video.isLiked}
                likesCount={video.likesCount}
              />
            </Box>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />

        {isWideScreen && (
          <Box>
            <Comments />
          </Box>
        )}
      </Box>
    </>
  );
}

export default LeftContainer;
