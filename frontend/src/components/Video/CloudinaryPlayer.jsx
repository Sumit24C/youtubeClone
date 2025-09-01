import cloudinary from 'cloudinary-video-player';
import 'cloudinary-video-player/cld-video-player.min.css';
import 'cloudinary-video-player/adaptive-streaming';
import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { extractErrorMsg } from "../../utils";
import { isCancel } from 'axios';

const VideoPlayer = ({ videoFile, thumbnail }) => {
  const { id } = useParams();
  const playerRef = useRef(null);
  const cloudinaryRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();
  const controllerRef = useRef(null);

  const [watchTime, setWatchTime] = useState(0);
  const [view, setView] = useState({})
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async function () {
      try {
        setLoading(true);
        const response = await axiosPrivate.get(`/views/${id}`, {
          signal: controller.signal
        });
        setView(response.data.data);
        if (response.data?.data?.watchTime) {
          setWatchTime(response.data.data.watchTime);
        }
      } catch (error) {
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id, axiosPrivate]);

  useEffect(() => {
    if (cloudinaryRef.current) return;

    cloudinaryRef.current = cloudinary;

    const player = cloudinaryRef.current.videoPlayer(playerRef.current, {
      cloud_name: import.meta.env.VITE_CLOUDINARY_NAME,
      autoplay: false,
      controls: true,
      sourceTypes: ['hls'],
      secure: true,
      fluid: false,
      width: '100%',
      height: '100%',
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      transformation: { streaming_profile: 'auto' },
      poster: thumbnail,
    });

    player.source(videoFile);

    player.on('timeupdate', () => {
      setWatchTime(player.currentTime());
    });

    console.log("current:", player.currentTime());

    // Function to send watch data
    const sendView = async (isCompleted = false) => {
      try {
        console.log(isCompleted);
        controllerRef.current = new AbortController();
        await axiosPrivate.post(
          `/views/${id}`,
          {}, // request body
          {
            params: {
              watchTime: Math.floor(player.currentTime()),
              isCompleted,
            },
            signal: controllerRef.current.signal,
          }
        );
      } catch (error) {
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      }
    };

    const handlePause = () => {
      if (player.currentTime() >= player.duration() - 0.1) return; 
      sendView(false);
    };

    const handleEnded = () => sendView(true);

    player.on("pause", handlePause);
    player.on("ended", handleEnded);

    // Send before tab close
    const handleBeforeUnload = () => sendView(view.isCompleted);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };

  }, [videoFile, thumbnail, id, axiosPrivate]);

  return (
    <Box
      sx={{
        width: '100%',
        aspectRatio: '16/9',
        minHeight: '360px',
        minWidth: '360px',
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: 'black',
        mx: 'auto',
      }}
    >
      <video
        ref={playerRef}
        className="cld-video-player"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
};

export default VideoPlayer;
