import React, { useState, useEffect } from 'react'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import ChannelCard from '../components/Channel/ChannelCard';
import { extractErrorMsg } from "../utils";
import { Box, Typography } from '@mui/material';
import { isCancel } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setChannels } from '../store/channelSlice';

function SubscribedChannel() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const dispatch = useDispatch();
  const { channelData } = useSelector((state) => state.channel)
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setLoading(true);
    setErrorMsg("");
    const controller = new AbortController();

    ; (async function () {
      try {
        const response = await axiosPrivate.get(`/subscriptions/u`, {
          signal: controller.signal
        })
        const subscription = response.data.data
        dispatch(setChannels(subscription.map((s) => s.channel)));
      } catch (error) {
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })()
  }, [])

  return (
    <Box sx={{ width: "100%", maxWidth: "900px", mx: "auto", mt: 3 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 2,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
        }}
      >
        All Subscriptions
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          p: 2,
          width: "100%",
        }}
      >
        {channelData && channelData.length > 0 ? (
          channelData.map((channel, index) => (
            <ChannelCard
              key={index}
              channelInfo={channel}
            />
          ))
        ) : (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 4 }}
          >
            No subscribed channels
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default SubscribedChannel