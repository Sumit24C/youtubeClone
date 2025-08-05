import React, { useEffect, useState } from 'react';
import CardContainer from './CardContainer';
import { Box, Typography } from '@mui/material';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { isCancel } from 'axios';
import extractErrorMsg from '../../utils/extractErrorMsg';

function MainContainer() {
  const axiosPrivate = useAxiosPrivate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  if (loading) return <>Loading...</>;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        p: 2,
        gap: 2,
        minHeight: '300px',
        width: '100%',
      }}
    >
      {videos && videos.length > 0 ? (
        videos.map((video, index) => (
          <CardContainer key={index} video={video} />
        ))
      ) : (
            <Typography textAlign="center">No videos available</Typography>
      )}
    </Box>
  );
}

export default MainContainer;
