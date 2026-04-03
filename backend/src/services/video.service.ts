import fs from "fs-extra";
import path from "path";
import { randomUUID } from "crypto";
import { exec } from "child_process";
import { uploadPathChunks, videoPath } from "../config/upload.config.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";

export const MAX_RETRIES = 5;
export const RETRY_DELAY = 1000;
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const videoUploadHandler = asyncHandler(async (req, res) => {
    if (!req.file) {
        return new ApiError(400, "No video file uploaded");
    }
    const chunkNumber = Number(req.body.chunkIndex);
    const totalChunks = Number(req.body.totalChunks);
    const fileName = req.body.originalname.replace(/\s+/g, '');
    let videoInfo = null;
    if (chunkNumber === totalChunks - 1) {
        videoInfo = await mergeChunks(fileName, totalChunks);
        await generateHLS(videoInfo.videoId, videoInfo.newFilename);
    }

    return res.status(200).json(
        new ApiResponse(200, videoInfo, 'Chunk uploaded successfully')
    );
});

export const mergeChunks = async function (fileName, totalChunks) {
    const videoId = randomUUID();
    const uniqueVideoDir = path.join(videoPath, videoId, "original");
    await fs.mkdir(uniqueVideoDir, { recursive: true });

    const newFilename = `original${path.extname(fileName)}`
    const finalVideoPath = path.join(uniqueVideoDir, newFilename);
    const writeStream = fs.createWriteStream(finalVideoPath);

    for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(uploadPathChunks, `${fileName}.part_${i}`);
        let retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                await new Promise((resolve, reject) => {
                    const chunkReadStream = fs.createReadStream(chunkPath);
                    chunkReadStream.on("error", reject)
                    chunkReadStream.on("end", async () => {
                        await fs.unlink(chunkPath);
                        resolve();
                    })
                    chunkReadStream.pipe(writeStream, { end: false });
                });
                break;
            } catch (error) {
                if (error.code === "EBUSY") {
                    console.log(`Chunk ${i} is busy, retrying... (${retries + 1}/${MAX_RETRIES})`);
                    await delay(RETRY_DELAY);
                    retries++;
                } else {
                    throw error;
                }
            }
        }

        if (retries === MAX_RETRIES) {
            console.error(`Failed to merge chunk ${i} after ${MAX_RETRIES} retries`);
            writeStream.end();
            throw new ApiError(500, `Failed to merge chunk ${i}`);
        }
    }

    writeStream.end();
    return { videoId, newFilename };
};

export const generateHLS = async function (videoId, filename) {
    const videoDir = path.join(videoPath, videoId);
    const inputPath = path.join(videoDir, "original", filename);
    const hlsDir = path.join(videoDir, "hls");

    await fs.mkdir(hlsDir, { recursive: true });

    const ffmpegCommand = `
    ffmpeg -i "${inputPath}" \
    -filter_complex "[0:v]split=2[v1][v2];[v1]scale=640:360[v1out];[v2]scale=1280:720[v2out]" \
    -map "[v1out]" -map 0:a? -c:v:0 libx264 -b:v:0 800k \
    -map "[v2out]" -map 0:a? -c:v:1 libx264 -b:v:1 2800k \
    -var_stream_map "v:0,name:360p v:1,name:720p" \
    -master_pl_name master.m3u8 \
    -f hls \
    -hls_time 10 \
    -hls_list_size 0 \
    -hls_segment_filename "${hlsDir}/%v/seg_%03d.ts" \
    "${hlsDir}/%v/index.m3u8"
    `;

    return new Promise((resolve, reject) => {
        exec(ffmpegCommand, (error, stdout, stderr) => {
            if (error) {
                console.error("FFmpeg error:", stderr);
                reject(error);
            } else {
                console.log("HLS generation completed");
                resolve();
            }
        });
    });
};