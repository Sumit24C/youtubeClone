const getHlsUrl = (videoUrl) => {
  const public_id = videoUrl
    .split('/upload/')[1]
    .replace(/\.[^/.]+$/, ""); // removes .mp4 etc.

  const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
  const hlsUrl = `https://res.cloudinary.com/${cloudName}/video/upload/sp_auto/${public_id}.m3u8`;
    console.log(hlsUrl)
  return hlsUrl
};

export default getHlsUrl;