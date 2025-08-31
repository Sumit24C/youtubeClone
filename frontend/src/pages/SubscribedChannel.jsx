import React, { useState, useEffect } from 'react'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import ChannelCard from '../components/Channel/ChannelCard';

function SubscribedChannel() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [channels, setChannels] = useState([]);
  const axiosPrivate = useAxiosPrivate;

  useEffect(() => {
    setLoading(true);
    setErrorMsg("");
    const controller = new AbortController();

    ; (async function () {
      try {
        const response = await axiosPrivate.get(`/subscriptions/u`, {
          signal: controller.signal
        })
        setChannels(response.data.data);

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
      {channels && channels.length > 0 && (
        channels.map((channel, index) => (
          <ChannelCard key={index} channelInfo={channel} />
        ))
      )}
    </Box>
  );
}

export default SubscribedChannel