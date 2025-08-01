import { useRef, useEffect, useMemo } from "react";
import videojs from 'video.js';
import { getHlsUrl } from "../../utils/index";
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import 'videojs-http-source-selector';

function VideoPlayer({ videoFile, thumbnail }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const hlsUrl = getHlsUrl(videoFile);

  const options = useMemo(() => ({
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
    playbackRates: [0.5, 1, 1.5, 2],
    aspectRatio: '16:9',
    poster: thumbnail,
    sources: [
      {
        src: hlsUrl,
        type: 'application/x-mpegURL',
      },
    ],
  }), [thumbnail, hlsUrl]);

  useEffect(() => {
    const videoElement = document.createElement('video');
    videoElement.classList.add("video-js", 'vjs-big-play-centered');
    videoElement.setAttribute('controls', true);
    if (videoRef.current) {
      videoRef.current.appendChild(videoElement);
    }

    const player = (playerRef.current = videojs(videoElement, options, function () {
      videojs.log('player is ready');
      const playerInstance = this;

      playerInstance.ready(() => {
        playerInstance.httpSourceSelector({
          default: 'auto',
        });
      });

      playerInstance.on('waiting', () => {
        console.log('Player is waiting');
      });

      playerInstance.on('dispose', () => {
        console.log('Player will dispose');
      });

      playerInstance.autoplay(options.autoplay);
      playerInstance.src(options.sources);
    }));

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    }

  }, [videoFile, thumbnail, hlsUrl]);

  return (
    <>
      <div className='video-player' data-vjs-player>
        <div ref={videoRef} />
      </div>
    </>
  );
}

export default VideoPlayer;
