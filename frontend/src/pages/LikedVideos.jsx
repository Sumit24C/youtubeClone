import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  CardMedia,
  IconButton,
} from '@mui/material';
import PlayArrow from '@mui/icons-material/PlayArrow';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { isCancel } from 'axios';
import extractErrorMsg from '../utils/extractErrorMsg';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import CardContainer from '../components/Main/CardContainer';

function LikedVideos() {
  const userData = useSelector((state) => state.auth.userData);
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [likedVideos, setLikedVideos] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    setErrorMsg('');

    (async function () {
      try {
        const response = await axiosPrivate.get(`/likes/videos`);
        const likes = response.data.data;
        setLikedVideos(likes.map((l) => l.video));
      } catch (error) {
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
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
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', bgcolor: '#0f0f0f', color: 'white' }}>
      {/* LEFT SIDEBAR */}
      <Box sx={{ width: 350, p: 3, bgcolor: 'linear-gradient(135deg, #333, #111)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CardMedia
          component="img"
          image={likedVideos[0]?.thumbnailUrl}
          sx={{ width: '100%', height: 200, borderRadius: 2, mb: 2 }}
        />
        <Typography
          variant="h5"
          fontWeight="bold"
          mb={1}
        >Liked videos
        </Typography>
        <Typography
          variant="body2"
          color="grey.400"
          mb={1}
        >
          {userData?.username}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: "center"
          }}
        >
          <Button
            onClick={() => navigate(`/v/${likedVideos[0]?._id}/Pl=/like`)}
            variant="contained"
            startIcon={<PlayArrow />}
            sx={{ borderRadius: 20, bgcolor: 'white', color: 'black', fontWeight: 'bold' }}
          >
            Play all
          </Button>

          <Typography variant="body2" color="grey.400">
            {likedVideos.length} videos
          </Typography>
        </Box>
      </Box>

      {/* RIGHT VIDEO LIST */}
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
        <Box mt={2} width={"70%"} marginX={5}>
          {errorMsg ? (
            <Typography textAlign="center" color="error">{errorMsg}</Typography>
          ) : likedVideos && likedVideos.length > 0 ? (
            likedVideos.map((video, index) => (
              <Box my={1}>
                <CardContainer
                  key={index}
                  video={video}
                  vertical
                  size='large'
                  isLiked={true}
                  setVideos={setLikedVideos}
                />
              </Box>
            ))
          ) : (
            <Typography textAlign="center">No videos available</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default LikedVideos;
