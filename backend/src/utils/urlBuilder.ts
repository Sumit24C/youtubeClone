const R2_BASE_URL = process.env.R2_PUBLIC_URL;

export const getFileUrl = (key: string): string => {
    return `${R2_BASE_URL}/${key}`;
};

export const getHlsUrl = (videoId: string): string => {
    return `${R2_BASE_URL}/videos/${videoId}/hls/master.m3u8`;
};

export const getVideoFolder = (videoId: string): string => {
    return `${R2_BASE_URL}/videos/${videoId}`;
};