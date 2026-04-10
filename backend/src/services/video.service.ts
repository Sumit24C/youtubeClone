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

                generateHLS(videoInfo.videoId, videoInfo.newFilename).catch(
                    (err) => console.error("Hls Failed: ", err)
                );
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
    // const writeStream = fs.createWriteStream(finalVideoPath);
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
        // let retries = 0;

        // while (retries < MAX_RETRIES) {
        //     try {
        //         await new Promise<void>((resolve, reject) => {
        //             const chunkReadStream = fs.createReadStream(chunkPath);

        //             chunkReadStream.on("error", reject);
        //             writeStream.on("error", reject);

        //             chunkReadStream.on("end", async () => {
        //                 await fs.unlink(chunkPath);
        //                 resolve();
        //             });

        //             writeStream.once("drain", resolve);
        //             chunkReadStream.pipe(writeStream, { end: false });
        //         });

        //         break;
        //     } catch (err) {
        //         const error = err as NodeJS.ErrnoException;

        //         if (error.code === "EBUSY") {
        //             console.log(
        //                 `Chunk ${i} busy, retry ${retries + 1}/${MAX_RETRIES}`
        //             );
        //             await delay(RETRY_DELAY);
        //             retries++;
        //         } else {
        //             throw error;
        //         }
        //     }
        // }

        // if (retries === MAX_RETRIES) {
        //     writeStream.end();
        //     throw new ApiError(500, `Failed to merge chunk ${i}`);
        // }
    }

    // writeStream.end();
    await fs.remove(chunkUploadDir);
    return { videoId, newFilename };
};

export const generateHLS = async (
    videoId: string,
    filename: string
): Promise<void> => {
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
