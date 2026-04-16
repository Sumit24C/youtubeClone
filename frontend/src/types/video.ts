import type { Channel } from "./channel";

export type Video = {
    _id: string;

    title: string;
    description?: string;

    subtitles: {
        subtitleUrl: string;
        language: string;
    }[];

    thumbnailUrl: string;
    streamUrl?: string;

    duration: number;
    status: "uploading" | "processing" | "failed" | "ready";

    comments: number;
    views: number;
    likesCount?: number;

    createdAt: string;
    updatedAt?: string;

    channel: Channel[];

    isLiked?: boolean;
    isDisliked?: boolean;
    isPublished?: boolean;
    isPrivate?: boolean;

};