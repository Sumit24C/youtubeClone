import { Button } from '@mui/material';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { isCancel } from 'axios';
import { useEffect, useState, useRef } from 'react';
const SubscribeButton = ({ isSubscribed, setSubscribersCount, channelId }) => {
  const [subscribed, setSubscribed] = useState(isSubscribed);
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const controller = useRef(null);
  controller.current = new AbortController();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.post(`/subscriptions/c/${channelId}`, {
        signal: controller.current.signal
      });

      const subscribedRes = response.data.data.isSubscribed
      setSubscribed(subscribedRes);

      if (subscribedRes) {
        setSubscribersCount(prev => prev + 1)
      } else {
        setSubscribersCount(prev => prev - 1)
      }

    } catch (error) {
      if (isCancel(error)) {
        console.error("subscribeAxios :: error :: ", error)
      } else {
        console.error("subscribe :: error :: ", error)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      controller.current.abort();
    }
  }, [])

  return (
    <Button
      variant="contained"
      onClick={handleSubscribe}
      loading={loading}
      sx={{
        minWidth: '94px',
        height: '36px',
        borderRadius: '18px',
        fontSize: '0.8rem',
        fontWeight: 600,
        textTransform: 'none',
        bgcolor: 'white',
        color: 'black',
        px: 0,
        py: 0,
        '&:hover': {
          bgcolor: '#e5e5e5',
        },
      }}
    >
      {subscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  );
};

export default SubscribeButton;
