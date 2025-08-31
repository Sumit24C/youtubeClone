import cloudinary from 'cloudinary-video-player';
import 'cloudinary-video-player/cld-video-player.min.css';
import 'cloudinary-video-player/adaptive-streaming';
import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const VideoPlayer = ({ videoFile, thumbnail }) => {
  const playerRef = useRef(null);
  const cloudinaryRef = useRef(null);
  console.log("videoFile: ",videoFile);
  useEffect(() => {

    if (cloudinaryRef.current) return;

    cloudinaryRef.current = cloudinary;

    const player = cloudinaryRef.current.videoPlayer(playerRef.current, {
      cloud_name: import.meta.env.VITE_CLOUDINARY_NAME,
   autoplay: true,
      controls: true,
      sourceTypes: ['hls'],
      secure: true,
      fluid: false,
      width: '100%',
      height: '100%',
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      transformation: {
        streaming_profile: 'auto',
      },
      poster: thumbnail,
    });

    player.source(videoFile);
  }, [videoFile, thumbnail]);

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
