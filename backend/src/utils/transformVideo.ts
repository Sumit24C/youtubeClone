import { VideoBase } from "types/video.js";
import { getFileUrl, getHlsUrl } from "./urlBuilder.js"

export const transformVideo = (video: any, subtitles: any[] = []) => {
    const base = video.toObject?.() ?? video;
    return {
        ...base,
        subtitles: subtitles
            .filter((s) => s.status === "ready")
            .map((s) => ({
                subtitleUrl: getFileUrl(s.key),
                language: s.language,
            })),
        thumbnailUrl: getFileUrl(base.thumbnail),
        streamUrl: getHlsUrl(base._id)
    };
};