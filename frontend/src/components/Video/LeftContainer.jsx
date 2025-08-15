import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import { extractErrorMsg, displayCreatedAt } from '../../utils/index.js'
import { isCancel } from 'axios'
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate.js'
import { Box, Typography, Divider, useMediaQuery } from '@mui/material';
import CloudinaryPlayer from './CloudinaryPlayer.jsx'
import VideoDetails from './VideoDetails.jsx';
import Comments from '../../pages/Comments.jsx';
function LeftContainer({isWideScreen}) {

  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    ; (async () => {
      try {
        const response = await axiosPrivate.get(`/videos/${id}`, {
          signal: controller.signal
        });
        setVideo(response.data.data);

      } catch (error) {
        if (isCancel(error)) {
          console.log("MainError :: error :: ", error)
        } else {
          console.error(error);
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })()

    return () => {
      controller.abort();
    }
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Box
        sx={{
          width: '100%',
          maxWidth: '900px',
          mx: 'auto',
        }}
      >
        {video && (
          <Box>
            <Box
              sx={{
                width: '100%',
                mb: 1,
              }}
            >
              <CloudinaryPlayer videoFile={video.videoFile} thumbnail={video.thumbnail} />
            </Box>

            <Typography variant="h6" fontWeight={'bold'} mt={1}>
              {video.title}
            </Typography>

            <Box>
              <VideoDetails channel={video.channel[0]} isLiked={video.isLiked} likesCount={video.likesCount} />
            </Box>
          </Box>
        )}
        <Divider sx={{ my: 2 }} />

        {isWideScreen && <Box>
          <Comments />
        </Box>}
      </Box>

    </>
  )
}

export default LeftContainer