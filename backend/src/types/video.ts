import { Types } from "mongoose";

export type VideoBase = {
    _id: Types.ObjectId;
    title: string;
    description: string;
    duration: number;
    isPublished: boolean;
    owner: Types.ObjectId;
    status: "uploading" | "processing" | "ready" | "failed";
    thumbnail?: string;
    createdAt: Date;
    updatedAt: Date;
};