import React from 'react'
import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom'
import extractErrorMsg from '../utils/extractErrorMsg.js'
import VideoPlayer from '../components/videoJS/VideoPlayer';

function VideoPage() {
  const videoId = useParams();
  const location = useLocation();
  const [video, setVideo] = useState(location.state?.video || null);
  const [errorMsg, setErrorMsg] = useState("")
  const [loading, setLoading] = useState(false)

  console.log('workin')
  console.log(video)
  useEffect(() => {
    if (video) return;

    console.log("WOrking")
    setLoading(true);
    const controller = new AbortController();
    ; (async () => {
      try {
        const response = await axiosPrivate.get(`/videos/${videoId}`, {
          signal: controller.signal
        });

        console.log("videoData: ", response.data.data)
        setVideo(response.data.data);

      } catch (error) {
        if (isCancel(error)) {
          console.log("MainError :: error :: ", error)
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

  }, [])

  if (loading) {
    return <>loading...</>
  }
  return (
    <>
        {video && (
          <VideoPlayer videoFile={video.videoFile} />
        )}

    </>
  )
}

export default VideoPage