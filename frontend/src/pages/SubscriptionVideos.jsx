import React, { useEffect, useState } from 'react';
import CardContainer from '../components/Main/CardContainer';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Divider,
  Stack,
  IconButton
} from '@mui/material';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { isCancel } from 'axios';
import extractErrorMsg from '../utils/extractErrorMsg';
import { useSelector } from 'react-redux';

function SubscriptionVideos() {
  const userData = useSelector((state) => state.auth.userData);
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [videos, setVideos] = useState([]);
  useEffect(() => {
    setLoading(true);
    setErrorMsg('');

    (async function () {
      try {
        const response = await axiosPrivate.get(`/subscriptions/u/v`);
        const subscribedList = response.data.data
        setVideos(subscribedList.map((s) => s.videos));
      } catch (error) {
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  if (loading && videos.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          width: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
          <CardContainer key={index} video={video} subscribed={true} />
        ))
      ) : (
        <p>No subscribed channel videos available</p>
      )}
    </Box>
  );
}

export default SubscriptionVideos;
