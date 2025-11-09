import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { isCancel } from 'axios';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { extractErrorMsg } from '../../utils';
import CardContainer from '../Main/CardContainer';
import { Box, CircularProgress, Typography } from '@mui/material';

function ChannelVideos() {

  const [videos, setVideos] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();
  const { id } = useParams();

  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const response = await axiosPrivate.get(`/videos/c/${id}`);
        setVideos(response.data.data);
      } catch (error) {
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })();

  }, [id]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  return (
    <>
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
    </>
  )
}

export default ChannelVideos