import "dotenv/config";
import { Worker } from "bullmq";
import { redis } from ".././config/redis.js";
import path from "node:path";
import fs from "fs-extra";
import { downloadFromR2 } from "../services/r2.service.js";
import { ApiError } from "utils/ApiError.js";
import connectDB from "db/index.js";
import { Subtitle } from "models/subtitle.model.js";
import { parseSync } from "subtitle";
import { deleteFromR2 } from "../services/r2.service.js";

await connectDB();

export const subtitleWorker = new Worker("subtitle-processing", async (job) => {
    const { key, trackId } = job.data;

    const tempDir = path.join("temp", `${trackId}-${job.id}`);
    const ext = path.extname(key) || ".srt";
    const filePath = path.join(tempDir, `subtitle${ext}`);

    let shouldCleanupR2 = false;

    try {
        await fs.mkdir(tempDir, { recursive: true });

        console.log(`[Job ${job.id}] Downloading subtitle...`);
        await downloadFromR2(key, filePath);

        const subtitleDoc = await Subtitle.findByIdAndUpdate(
            trackId,
            { status: "processing" },
            { new: true }
        );

        if (!subtitleDoc) {
            shouldCleanupR2 = true;
            throw new ApiError(404, "Subtitle track not found");
        }

        console.log(`[Job ${job.id}] Parsing subtitle...`);
        const raw = await fs.readFile(filePath, "utf-8");
        const nodes = parseSync(raw);

        const parsed = nodes
            .filter((node) => node.type === "cue" && node.data?.text)
            .map((node: any) => ({
                text: node.data.text
                    .replace(/<[^>]+>/g, "")
                    .replace(/\s+/g, " ")
                    .trim(),
                startTime: node.data.start / 1000,
                endTime: node.data.end / 1000,
            }));

        if (parsed.length === 0) {
            shouldCleanupR2 = true;
            throw new Error("Parsed subtitle is empty");
        }

        const fullText = parsed
            .map((p: any) => p.text)
            .join(" ")
            .slice(0, 50000);

        await Subtitle.findByIdAndUpdate(trackId, {
            content: parsed,
            fullText,
            status: "ready",
        });

        console.log("Subtitle processed successfully:", trackId);

    } catch (err: any) {
        console.error("Subtitle worker failed:", err);

        await Subtitle.findByIdAndUpdate(trackId, {
            status: "failed",
        });
        if (shouldCleanupR2 && key) {
            try {
                console.log("Cleaning up R2 file...");
                await deleteFromR2(key);
            } catch (cleanupErr) {
                console.error("Failed to cleanup R2:", cleanupErr);
            }
        }

        throw err;

    } finally {
        await fs.remove(tempDir);
    }
}, { connection: redis });