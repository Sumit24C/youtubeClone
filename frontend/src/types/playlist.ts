import type { Video } from "./video";

export type Playlist = {
    _id: string;
    owner: string;
    name: string;
    description: string;
    isPrivate: boolean;
    videosCount: number;
    updatedAt: string;
    videos?: string[];
    lastVideo?: Video;
    playlistVideos?: Video[];

    totalVideos?: number;
    totalViews?: number;
    totalDuration?: number;
};