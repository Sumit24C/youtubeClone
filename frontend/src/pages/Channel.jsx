import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import { extractErrorMsg, displayCreatedAt } from '../utils/index.js'
import { useSubscribe } from '../hooks/useSubscribe.js';
import { isCancel } from 'axios'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate.js'
import { Box, Typography, Avatar, Button, Link } from '@mui/material';
function Channel() {

  const { id } = useParams();
  const [channelInfo, setChannelInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)
  const axiosPrivate = useAxiosPrivate()
  const subscribed =true;

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    ; (async () => {
      try {
        const response = await axiosPrivate.get(`/users/channel-profile/${id}`, {
          signal: controller.signal
        });
        console.log("channelData: ", response.data.data)
        setChannelInfo(response.data.data);
      } catch (error) {
        if (isCancel(error)) {
          console.log("ChannelAxios :: error :: ", error)
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
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <Box sx={{ bgcolor: '#0f0f0f', pb: 3 }}>
      {/* Banner */}
      <Box
        sx={{
          bgcolor: '#1f1f1f',
          color: 'white',
          height: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 700,
          borderRadius: 3,
          mb: 2,
          px: 2,
        }}
      >
        <Typography variant="h4" sx={{ textAlign: 'center' }}>
          complex engineering topics{' '}
          <Box component="span" sx={{ color: '#c5e478' }}>{'{ simplified }'}</Box>
        </Typography>
      </Box>

      {/* Profile Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, gap: 2 }}>
        <Avatar
          src="https://yt3.googleusercontent.com/.../photo.jpg" // replace with actual avatar
          alt="Monis Yousuf"
          sx={{ width: 80, height: 80 }}
        />
        <Box>
          <Typography fontSize="1.5rem" fontWeight={700} color="white">
            Monis Yousuf
          </Typography>
          <Typography color="gray">
            @MonisYousuf · 3.85K subscribers · 16 videos
          </Typography>
          <Typography color="gray" mt={0.5}>
            Complex Engineering Topics. Simplified.
            <Link href="https://monisyousuf.com" target="_blank" rel="noopener" sx={{ color: '#3ea6ff', ml: 1 }}>
              monisyousuf.com
            </Link>
            {' · '}
            <Link href="#" sx={{ color: '#3ea6ff' }}>1 more link</Link>
          </Typography>
        </Box>

        {/* Subscribe Button */}
        <Button
          onClick={() => setSubscribed(!subscribed)}
          variant="contained"
          sx={{
            ml: 'auto',
            borderRadius: '20px',
            backgroundColor: subscribed ? '#e5e5e5' : 'white',
            color: 'black',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1.2,
            '&:hover': {
              backgroundColor: subscribed ? '#ccc' : '#f1f1f1',
            },
          }}
        >
          {subscribed ? 'Subscribed' : 'Subscribe'}
        </Button>
      </Box>
    </Box>
  );
};

export default Channel