import fs from "fs-extra";
import fsNative from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { exec } from "child_process";
import { Request, Response } from "express";

import { uploadPathChunks, videoPath } from "../config/upload.config.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { videoQueue } from "queues/video.queue.js";

export const MAX_RETRIES = 5;
export const RETRY_DELAY = 1000;

export const delay = (ms: number): Promise<void> =>
    new Promise((res) => setTimeout(res, ms));

interface VideoInfo {
    videoId: string;
    newFilename: string;
}

interface MulterRequest extends Request {
    file?: Express.Multer.File;
}

const areAllChunksPresent = async (
    uploadDir: string,
    totalChunks: number
): Promise<boolean> => {
    const files = await fs.readdir(uploadDir);

    const chunkSet = new Set(files);

    for (let i = 0; i < totalChunks; i++) {
        if (!chunkSet.has(`chunk_${i}`)) {
            return false;
        }
    }

    return true;
};

// not in use, since now the upload is done using signed-url
export const videoUploadHandler = asyncHandler(
    async (req: MulterRequest, res: Response) => {
        if (!req.file) {
            throw new ApiError(400, "No video file uploaded");
        }
        const uploadId = req.body.uploadId;
        const chunkNumber = Number(req.body.chunkIndex);
        const totalChunks = Number(req.body.totalChunks);
        const originalFilename = req.body.originalname.replace(/\s+/g, "");

        if (
            !uploadId ||
            isNaN(chunkNumber) ||
            isNaN(totalChunks) ||
            !originalFilename
        ) {
            throw new ApiError(401, "All fields are required");
        }

        let videoInfo: VideoInfo | null = null;
        const uploadChunkDir = path.join(uploadPathChunks, uploadId);

        const allChunksReady = await areAllChunksPresent(
            uploadChunkDir,
            totalChunks
        );

        if (allChunksReady) {
            const lockPath = path.join(uploadChunkDir, "merge.lock");

            try {
                await fsNative.promises.writeFile(lockPath, "processing", {
                    flag: "wx",
                });
            } catch (err: any) {
                if (err.code === "EEXIST") {
                    return res
                        .status(200)
                        .json(new ApiResponse(200, null, "Already processing"));
                }
                throw err;
            }

            try {
                videoInfo = await mergeChunks(
                    uploadId,
                    totalChunks,
                    originalFilename
                );

                await videoQueue.add("process-video", {
                    videoId: videoInfo.videoId,
                    filename: videoInfo.newFilename,
                });

                // generateHLS(videoInfo.videoId, videoInfo.newFilename).catch(
                //     (err) => console.error("Hls Failed: ", err)
                // );
            } catch (error) {
                await fs.remove(lockPath);
                if (error instanceof ApiError) {
                    throw error;
                }
                throw new ApiError(500, "Failed to upload file", [error]);
            }
        }

        return res
            .status(200)
            .json(
                new ApiResponse<VideoInfo | null>(
                    200,
                    videoInfo,
                    "Chunk uploaded successfully"
                )
            );
    }
);

export const mergeChunks = async (
    uploadId: string,
    totalChunks: number,
    originalName: string
): Promise<VideoInfo> => {
    const videoId = randomUUID();
    const uniqueVideoDir = path.join(videoPath, videoId, "original");

    await fs.mkdir(uniqueVideoDir, { recursive: true });

    const ext = path.extname(originalName) || ".mp4";
    const newFilename = `original${ext}`;
    const finalVideoPath = path.join(uniqueVideoDir, newFilename);
    await fs.writeFile(finalVideoPath, "");

    const chunkUploadDir = path.join(uploadPathChunks, uploadId);

    for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(chunkUploadDir, `chunk_${i}`);
        if (!(await fs.pathExists(chunkPath))) {
            throw new ApiError(400, `Missing chunk ${i}`);
        }

        const data = await fs.readFile(chunkPath);
        await fs.appendFile(finalVideoPath, data);
        await fs.unlink(chunkPath);
    }

    await fs.remove(chunkUploadDir);
    return { videoId, newFilename };
};

export const generateHLS = async (
    inputPath: string,
    hlsDir: string
): Promise<void> => {
    await fs.mkdir(hlsDir, { recursive: true });
    await fs.mkdir(path.join(hlsDir, "0"), { recursive: true });
    await fs.mkdir(path.join(hlsDir, "1"), { recursive: true });

    const ffmpegCommand = `
        ffmpeg -y -i "${inputPath}" \
        -filter_complex "[0:v]split=2[v1][v2];[v1]scale=640:360[v1out];[v2]scale=1280:720[v2out]" \
        -map "[v1out]" -map 0:a:0? \
        -map "[v2out]" -map 0:a:0? \
        -c:v:0 libx264 -b:v:0 800k \
        -c:v:1 libx264 -b:v:1 2800k \
        -c:a:0 aac -b:a:0 96k \
        -c:a:1 aac -b:a:1 128k \
        -pix_fmt yuv420p \
        -var_stream_map "v:0,a:0,name:360p v:1,a:1,name:720p" \
        -master_pl_name master.m3u8 \
        -f hls \
        -hls_time 10 \
        -hls_list_size 0 \
        -hls_segment_filename "${hlsDir}/%v/seg_%03d.ts" \
        "${hlsDir}/%v/index.m3u8"
    `;

    return new Promise<void>((resolve, reject) => {
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

export const getDuration = (inputPath: string): Promise<number> => {
    return new Promise((resolve, reject) => {
        exec(
            `ffprobe -v error -show_entries format=duration -of csv=p=0 "${inputPath}"`,
            (err, stdout) => {
                if (err) return reject(err);
                resolve(Math.floor(parseFloat(stdout)));
            }
        );
    });
};

// export const generateHLS = async (
//     videoId: string,
//     filename: string
// ): Promise<void> => {
//     const videoDir = path.join(videoPath, videoId);
//     const inputPath = path.join(videoDir, "original", filename);
//     const hlsDir = path.join(videoDir, "hls");

//     await fs.mkdir(hlsDir, { recursive: true });

//     const ffmpegCommand = `
//     ffmpeg -i "${inputPath}" \
//     -filter_complex "[0:v]split=2[v1][v2];[v1]scale=640:360[v1out];[v2]scale=1280:720[v2out]" \
//     -map "[v1out]" -map 0:a? -c:v:0 libx264 -b:v:0 800k \
//     -map "[v2out]" -map 0:a? -c:v:1 libx264 -b:v:1 2800k \
//     -var_stream_map "v:0,name:360p v:1,name:720p" \
//     -master_pl_name master.m3u8 \
//     -f hls \
//     -hls_time 10 \
//     -hls_list_size 0 \
//     -hls_segment_filename "${hlsDir}/%v/seg_%03d.ts" \
//     "${hlsDir}/%v/index.m3u8"
//   `;

//     return new Promise<void>((resolve, reject) => {
//         exec(ffmpegCommand, (error, stdout, stderr) => {
//             if (error) {
//                 console.error("FFmpeg error:", stderr);
//                 reject(error);
//             } else {
//                 console.log("HLS generation completed");
//                 resolve();
//             }
//         });
//     });
// };
