import { useRef } from "react";
import VideoJS from "./VideoJS";
import videojs from 'video.js';

function VideoPlayer({ videoFile }) {
  const getPublicIdFromCloudinaryUrl = (videoUrl) => {
    return videoUrl
      .split('/upload/')[1]
      .split('/')
      .slice(1)
      .join('/')
      .replace(/\.[^/.]+$/, "");
  };

  const public_id = getPublicIdFromCloudinaryUrl(videoFile);
  const cloudName = import.meta.env.VITE_CLOUDINARY_NAME; // ✅ use correct Vite-style env var
  const hlsUrl = `https://res.cloudinary.com/${cloudName}/video/upload/sp_auto/${public_id}.m3u8`;

  const playerRef = useRef(null);

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: hlsUrl,
      type: 'application/x-mpegURL',
    }]
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    player.on('waiting', () => {
      videojs.log('player is waiting');
    });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });
  };

  return (
    <>
      <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
    </>
  );
}

export default VideoPlayer;
