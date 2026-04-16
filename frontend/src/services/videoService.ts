import type { Axios } from "axios";

export const updateVideoDetails = async (
    api: Axios,
    {
        videoId,
        title,
        description,
        isPublished,
        thumbnail,
    }: {
        videoId: string;
        title: string,
        description: string,
        isPublished: boolean,
        thumbnail: string,
    }
) => {
    try {
        await api.patch(`/videos/${videoId}`, {
            title,
            description,
            isPublished,
            thumbnail,
        });
    } catch (error) {
        throw error
    }
};