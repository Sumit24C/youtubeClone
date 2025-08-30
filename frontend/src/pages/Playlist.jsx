import { useState, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { extractErrorMsg } from '../utils/index.js';
import { isCancel } from 'axios';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate.js';
import { Box, CircularProgress, Typography } from '@mui/material';
import PlaylistContainer from '../components/Playlist/PlaylistContainer.jsx';

function Playlist() {
  const [playlistInfo, setPlaylistInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();

    (async () => {
      try {
        const response = await axiosPrivate.get(`/playlist/current-user`, {
          signal: controller.signal
        });
        setPlaylistInfo(response.data.data);
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
  }, []);

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
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        p: 2,
        gap: 2,
        minHeight: '300px',
        width: '100%',
      }}
    >
      {playlistInfo && playlistInfo.length > 0 ? (
        playlistInfo.map((playlist, index) => (
          <PlaylistContainer key={index} playlist={playlist} setPlaylistInfo={setPlaylistInfo}/>
        ))
      ) : (
        <Typography textAlign="center">No playlist available</Typography>
      )}
    </Box>
  );
}

export default Playlist;
