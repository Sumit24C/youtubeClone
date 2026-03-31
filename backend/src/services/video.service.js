import fs from "fs-extra";
import path from "path";
import { uploadPathChunks } from "../config/upload.config.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { VIDEO_URL } from "../config/upload.config.js";

export const MAX_RETRIES = 5;
export const RETRY_DELAY = 1000;
export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export const videoUploadHandler = asyncHandler(async (req, res) => {
    if (!req.file) {
        return new ApiError(400, "No video file uploaded");
    }

    const chunkNumber = Number(req.body.chunk);
    const totalChunks = Number(req.body.totalChunks);
    const fileName = req.body.originalname.replace(/\s+/g, '');

    if (chunkNumber === totalChunks - 1) {
        await mergeChunks(fileName, totalChunks);
    }

    const fileInfo = {
        filename: fileName,
        originalName: req.body.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        baseURL: 'https://xyz.com/dist/video/',
        videoUrl: `${VIDEO_URL}/${fileName}`,
    };

    return res.status(200).json(
        new ApiResponse(200, { file: fileInfo }, 'Chunk uploaded successfully')
    );
});

export const mergeChunks = async function (fileName, totalChunks) {
    const writeStream = fs.createWriteStream(path.join(uploadPath, fileName));
    for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(uploadPathChunks, `${fileName}.part_${i}`);
        let retries = 0;
        while (retries < MAX_RETRIES) {
            try {
                const chunkReadStream = fs.createReadStream(chunkPath);
                await new Promise((resolve, reject) => {
                    chunkReadStream.pipe(writeStream, { end: false });
                    chunkReadStream.on("error", reject)
                    chunkReadStream.on("end", resolve)
                });
                console.log(`Merge chunk ${i} success`);
                await fs.promises.unlink(chunkPath);
                console.log(`deleted chunk ${i} success`);
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
    console.log(`successfully merged chunks`);
};