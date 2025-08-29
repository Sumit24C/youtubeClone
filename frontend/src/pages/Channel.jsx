import { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { extractErrorMsg } from '../utils/index.js';
import { isCancel } from 'axios';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate.js';
import ChannelHeader from '../components/Channel/ChannelHeader.jsx';
import ChannelTabs from '../components/Channel/ChannelTabs.jsx';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useSelector } from 'react-redux';

function Channel() {
  const { id } = useParams();
  const [channelInfo, setChannelInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();

    (async () => {
      try {
        const response = await axiosPrivate.get(`/users/channel-profile/${id}`, {
          signal: controller.signal
        });
        setChannelInfo(response.data.data);
      } catch (error) {
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  if (errorMsg) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">{errorMsg}</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" px={{ xs: 2, md: 6 }} mt={2}>
      {channelInfo && (
        <>
          <ChannelHeader channelInfo={channelInfo} />
          <ChannelTabs />
          <Outlet/>
        </>
      )}
    </Box>
  );
}

export default Channel;
