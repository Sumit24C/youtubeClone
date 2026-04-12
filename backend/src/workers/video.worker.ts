import "dotenv/config";
import { Worker } from "bullmq";
import { redis } from ".././config/redis.js";
import path from "node:path";
import fs from "fs-extra";
import { downloadFromR2, uploadFolderToR2 } from "../services/r2.service.js";
import { generateHLS, getDuration } from "../services/video.service.js";
import { Video } from "models/video.model.js";
import { ApiError } from "utils/ApiError.js";
import connectDB from "db/index.js";

await connectDB();
export const videoWorker = new Worker("video-processing", async (job) => {
    const { key, videoId } = job.data;

    const tempDir = path.join("temp", videoId);

    try {
        await fs.mkdir(tempDir, { recursive: true });

        const ext = path.extname(key) || ".mp4";
        const inputPath = path.join(tempDir, `input${ext}`);
        const hlsDir = path.join(tempDir, "hls");

        console.log("downloading..");
        await downloadFromR2(key, inputPath);

        console.log("processing..");
        const video = await Video.findByIdAndUpdate(videoId, { $set: { status: "processing" } });
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        const duration = await getDuration(inputPath);
        await generateHLS(inputPath, hlsDir);

        console.log("Uploading HLS...");
        await uploadFolderToR2(hlsDir, `videos/${videoId}/hls`);

        console.log("Done:", videoId);

        const updatedVideo = await Video.findByIdAndUpdate(
            videoId,
            {
                $set: {
                    status: "ready",
                    duration
                },
            },
            { new: true }
        );

        if (!updatedVideo) {
            throw new ApiError(404, "Video not found");
        }

    } catch (err: any) {
        console.error("Worker failed:", err);
        
        await Video.findByIdAndUpdate(videoId, {
            status: "failed",
        });
        throw err;

    } finally {
        await fs.remove(tempDir);
    }

}, { connection: redis });
