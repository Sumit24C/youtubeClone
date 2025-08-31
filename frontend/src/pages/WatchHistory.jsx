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
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrow from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import { useRef } from 'react';
import { useSelector } from 'react-redux';

function WatchHistory() {
  const userData = useSelector((state) => state.auth.userData);
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [videos, setVideos] = useState([]);
  const controllerRef = useRef(null);
  const [isHistory, setIsHistory] = useState(userData.isHistory);

  useEffect(() => {
    setLoading(true);
    setErrorMsg('');

    const controller = new AbortController();

    (async function () {
      try {
        const response = await axiosPrivate.get(`/users/watch-history`, {
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

  const handleClearWatchHistory = async () => {
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

  const handlePlayPauseWatchHistory = async () => {
    setLoading(true);
    setErrorMsg("");

    controllerRef.current = new AbortController();

    try {
      const response = await axiosPrivate.patch(`/users/watch-history/p`,
        {}, {
        signal: controllerRef.current.signal
      })

      setIsHistory(response.data.data.isHistory);

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
    <Box sx={{ display: 'flex', p: 2, gap: 3 }}>
      {/* Left Section - Watch History */}
      <Box sx={{ flex: 3 }}>
        {/* Header */}
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Watch history
        </Typography>

        <Divider />

        {/* Videos */}
        <Box mt={2} width={"70%"} marginX={5}>
          {errorMsg ? (
            <Typography textAlign="center" color="error">{errorMsg}</Typography>
          ) : videos && videos.length > 0 ? (
            videos.map((video, index) => (
              <CardContainer
                key={index}
                video={video}
                vertical
                size='large'
                history={true}
                setVideos={setVideos}
              />
            ))
          ) : (
            <Typography textAlign="center">No videos available</Typography>
          )}
        </Box>
      </Box>

      {/* Right Section - Controls */}
      <Box sx={{ flex: 1, minWidth: '250px' }}>
        <Box display="flex" alignItems="center" mb={2}>
          <SearchIcon sx={{ mr: 1 }} />
          <Typography variant="body1">Search watch history</Typography>
        </Box>

        <Stack spacing={2}>
          <Button startIcon={<DeleteIcon />} sx={{ justifyContent: 'flex-start' }} onClick={handleClearWatchHistory} loading={loading} disabled={loading}>
            Clear all watch history
          </Button>
          <Button
            startIcon={isHistory ? <PauseIcon /> : <PlayArrow />}
            sx={{ justifyContent: 'flex-start' }}
            onClick={handlePlayPauseWatchHistory}
            disabled={loading}
          >
            {isHistory ? "Pause" : "Play"} watch history
          </Button>

        </Stack>
      </Box>
    </Box>
  );
}

export default WatchHistory;
