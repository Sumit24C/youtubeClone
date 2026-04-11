import "dotenv/config";
import { Worker } from "bullmq";
import { redisConnection } from ".././config/redis.js";
import path from "node:path";
import fs from "fs-extra";
import { downloadFromR2, uploadFolderToR2 } from "../services/r2.service.js";
import { generateHLS } from "../services/video.service.js";

export const videoWorker = new Worker(
    "video-processing",
    async (job) => {
        const { key, videoId } = job.data;

        const tempDir = path.join("temp", videoId);
        await fs.mkdir(tempDir, { recursive: true });

        const ext = path.extname(key) || '.mp4';
        const inputPath = path.join(tempDir, `input${ext}`);
        const hlsDir = path.join(tempDir, "hls");

        console.log("downloading..");
        await downloadFromR2(key, inputPath);

        console.log("processing..");
        await generateHLS(inputPath, hlsDir);

        console.log("Uploading HLS...");
        await uploadFolderToR2(hlsDir, `videos/${videoId}/hls`);
        await fs.remove(tempDir);
        console.log("Done:", videoId);
    },
    { connection: redisConnection }
);
