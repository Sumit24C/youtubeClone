import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isCancel } from 'axios';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { Box, Typography } from '@mui/material';
import CardContainer from '../Main/CardContainer';

function RightContainer() {
  const { id } = useParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();

    (async () => {
      try {
        const response = await axiosPrivate.get("/videos", {
          signal: controller.signal,
        });
        setVideos(response.data.data);
      } catch (error) {
        if (!isCancel(error)) console.error(error);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  if (loading) return <>Loading...</>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {videos.length > 0 ? (
        videos
          .filter((video) => video._id !== id)
          .map((video, index) => (
            <CardContainer key={index} video={video} vertical />
          ))
      ) : (
        <Typography color="gray" textAlign="center">No videos available.</Typography>
      )}
    </Box>
  );
}

export default RightContainer;
