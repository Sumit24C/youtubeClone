import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const videoQueue = new Queue("video-processing", {
    connection: redis,
});

export const subtitleQueue = new Queue("subtitle-processing", {
    connection: redis,
});

