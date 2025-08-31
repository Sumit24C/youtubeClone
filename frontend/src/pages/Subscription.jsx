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
import { useRef } from 'react';
import { useSelector } from 'react-redux';

function Subscription() {
  const userData = useSelector((state) => state.auth.userData);
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [videos, setVideos] = useState([]);
  const controllerRef = useRef(null);
  useEffect(() => {
    setLoading(true);
    setErrorMsg('');

    const controller = new AbortController();

    (async function () {
      try {
        const response = await axiosPrivate.get(`/subscriptions/u/v`, {
          signal: controller.signal,
        });
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

    return () => controller.abort();
  }, []);

  const handleUnSubscribe = async () => {
    setLoading(true);
    setErrorMsg("");

    controllerRef.current = new AbortController();

    try {
      const response = await axiosPrivate.patch(`/users/watch-history`,
        {}, {
        signal: controllerRef.current.signal
      })

      if (response.data.data.cleared) {
        setVideos([]);
      }

    } catch (error) {
      if (!isCancel(error)) {
        setErrorMsg(extractErrorMsg(error))
      }
    } finally {
      setLoading(false);
    }

  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', width: '100%' }}>
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
      {videos && videos.length > 0 && (
        videos.map((video, index) => (
          <CardContainer key={index} video={video} />
        ))
      )}

      <div id="scroll-anchor" style={{ height: '20px' }}></div>

      {loading && videos.length > 0 && (
        <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={30} />
        </Box>
      )}
    </Box>
  );
}

export default Subscription;
