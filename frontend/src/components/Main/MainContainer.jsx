import React, { useEffect, useRef, useState } from 'react';
import CardContainer from './CardContainer';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useAxiosPrivate } from '../../hooks/useAxiosPrivate';
import { isCancel } from 'axios';
import extractErrorMsg from '../../utils/extractErrorMsg';

function MainContainer() {
  const axiosPrivate = useAxiosPrivate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const observerRef = useRef(null);
  const controllerRef = useRef(null);

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
    (async function () {
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
      {videos && videos.length > 0 ? (
        videos.map((video, index) => (
          <CardContainer key={index} video={video} />
        ))
      ) : (
        <Typography textAlign="center">No videos available</Typography>
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

export default MainContainer;
