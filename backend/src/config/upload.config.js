import path from "path";
import fs from "fs-extra";

export const uploadPath = path.join(process.cwd(), "uploads")
export const uploadPathChunks = path.join(process.cwd(), "chunks")

export const storagePath = path.join(process.cwd(), "storage");
export const videoPath = path.join(storagePath, "videos");
export const thumbnailPath = path.join(storagePath, "thumbnails");
export const chunkPath = path.join(storagePath, "chunks");

export const VIDEO_URL = `${BACKEND_URL}/storage/videos`;
export const THUMBAIL_URL = `${BACKEND_URL}/storage/thumbnail`;

await fs.mkdir(uploadPath, { recursive: true });
await fs.mkdir(uploadPathChunks, { recursive: true });
