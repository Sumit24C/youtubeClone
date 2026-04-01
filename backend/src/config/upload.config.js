import path from "path";
import fs from "fs-extra";
import { BACKEND_URL } from "../constants.js";

export const uploadPath = path.join(process.cwd(), "uploads")
export const uploadPathChunks = path.join(process.cwd(), "chunks")

export const videoPath = path.join(uploadPath, "videos");
export const thumbnailPath = path.join(uploadPath, "thumbnails");

export const VIDEO_URL = `${BACKEND_URL}/upload/videos`;
export const THUMBAIL_URL = `${BACKEND_URL}/upload/thumbnail`;

await fs.mkdir(uploadPath, { recursive: true });
await fs.mkdir(videoPath, { recursive: true });
await fs.mkdir(thumbnailPath, { recursive: true });

await fs.mkdir(uploadPathChunks, { recursive: true });
