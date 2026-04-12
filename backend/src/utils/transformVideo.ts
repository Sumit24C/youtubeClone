import { getHlsUrl, getThumbnailUrl } from "./urlBuilder.js"

export const transformVideo = (video: any) => {
    const base = video.toObject?.() ?? video;
    return {
        ...base,
        thumbnailUrl: getThumbnailUrl(base.thumbnail),
        streamUrl: getHlsUrl(video._id)
    };
};