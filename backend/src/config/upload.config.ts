import path from "path";
import fs from "fs-extra";
import { BACKEND_URL } from "../constants.js";

export const uploadPath = path.join(process.cwd(), "uploads")
export const uploadPathChunks = path.join(process.cwd(), "chunks")

export const videoPath = path.join(uploadPath, "videos");
export const VIDEO_URL = `${BACKEND_URL}/uploads/videos`;

await fs.mkdir(uploadPath, { recursive: true });
await fs.mkdir(videoPath, { recursive: true });

await fs.mkdir(uploadPathChunks, { recursive: true });
