import path from "path"
import fs from "fs-extra"
import multer from "multer";
import { ApiError } from "./ApiError.js";
import { asyncHandler } from "./asyncHandler.js"
import { ApiResponse } from "./ApiResponse.js";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPathChunks)
    },
    filename: (req, file, cb) => {
        const baseFileName = file.originalname.replace(/\s+/g, '');
        fs.readdir(uploadPathChunks, (err, files) => {
            if (err) {
                return cb(err)
            }
            const matchingFiles = files.filter((f) => f.startsWith(baseFileName));
            let chunkNumber = 0;
            if (matchingFiles.length > 0) {
                const highestChunkNumber = Math.max(
                    ...matchingFiles.map((f) => {
                        const match = f.regex(/\.part_(\d+)$/);
                        return match ? parseInt(match[1], 10) : -1;
                    })
                );
                chunkNumber = highestChunkNumber + 1;
            }
            const fileName = `${baseFileName}.part_${chunkNumber}`;
            cb(null, fileName);
        });
    }
});

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('/video') || file.mimetype === 'application/octet-stream') {
            cb(null, true);
        } else {
            cb(new ApiError(400, 'Not a video file. Please upload only videos.'));
        }
    }
});