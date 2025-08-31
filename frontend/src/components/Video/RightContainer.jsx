import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isCancel } from 'axios';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { Box, Typography, CircularProgress } from '@mui/material';
import CardContainer from '../Main/CardContainer';
import PlaylistVideo from '../Playlist/PlaylistVideo';
import { useRef } from 'react';
import { extractErrorMsg } from '../../utils';

function RightContainer() {
  const { id } = useParams();
  const { p_id } = useParams();
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const axiosPrivate = useAxiosPrivate();
  const controllerRef = useRef(null);
  const observerRef = useRef(null);

  const fetchVideos = async (pageNum) => {
    setLoading(true);
    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();
    try {
      const response = await axiosPrivate.get(`/videos?page=${pageNum}`, {
        signal: controllerRef.current.signal,
      });
      const { videos: newVideos, totalPages } = response.data.data;

      setVideos((prev) => [...prev, ...newVideos]);
      setTotalPages(totalPages);
      setPage(pageNum);
    } catch (error) {
      if (!isCancel(error)) {
        setErrorMsg(extractErrorMsg(error));
      }
    } finally {
      setLoading(false);
      setErrorMsg('');
    }
  };

  useEffect(() => {
    ; (async function () {
      await fetchVideos(1);
    })();
  }, []);

  useEffect(() => {
    if (loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && page < totalPages) {
        fetchVideos(page + 1);
      }
    });

    if (document.getElementById('scroll-anchor')) {
      observer.observe(document.getElementById('scroll-anchor'));
    }

    observerRef.current = observer;
  }, [page, loading, totalPages]);

  useEffect(() => {
    return () => controllerRef.current?.abort();
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        {p_id && (p_id === "like" ? <PlaylistVideo isFromLiked={true} /> : <PlaylistVideo />)}
      </Box>
      {videos && videos.length > 0 ? (
        videos
          .filter((video) => p_id || video._id !== id)
          .map((video, index) => (
            <CardContainer key={index} video={video} vertical />
          ))
      ) : (
        <Typography color="gray" textAlign="center">No videos available.</Typography>
      )}

      {loading && videos.length > 0 && (
        <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={30} />
        </Box>
      )}
    </Box>
  );
}

export default RightContainer;
