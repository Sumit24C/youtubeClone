import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import {extractErrorMsg, displayCreatedAt} from '../../utils/index.js'
import { isCancel } from 'axios'
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate.js'
import VideoPlayer from './VideoPlayer.jsx';
import { Box, Typography, Divider } from '@mui/material';

function LeftContainer() {

  const { id } = useParams();
  console.log(id);
  const location = useLocation();
  const [video, setVideo] = useState(location.state?.video || null);
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const axiosPrivate = useAxiosPrivate()

  useEffect(() => {
    if (video) return;
    setLoading(true);
    const controller = new AbortController();
    ; (async () => {
      try {
        const response = await axiosPrivate.get(`/videos/${id}`, {
          signal: controller.signal
        });

        console.log("videoData: ", response.data.data)
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

  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Box>
        
        {video && (
          <VideoPlayer videoFile={video.videoFile} thumbnail={video.thumbnail} />
        )}

        <Typography variant="h6" mt={2}>
          {video.title}
        </Typography>

        <Typography variant="body2" color="gray">
          {video.views} views • {displayCreatedAt(video.createdAt || 'now')}
        </Typography>

        <Divider sx={{ my: 2 }} />
      </Box>
    </>
  )
}

export default LeftContainer