import fs from "fs-extra";
import path from "path";
import multer from "multer";
import { ApiError } from "../utils/ApiError.js";
import { uploadPathChunks, videoPath } from "../config/upload.config.js";

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const videoId = req.body.videoId;
        const thumbnailDir = path.join(videoPath, videoId, "thumbnail");
        await fs.mkdir(thumbnailDir, { recursive: true });
        cb(null, thumbnailDir);
    },
    filename: (req, file, cb) => {
        cb(null, `thumbnail${path.extname(file.originalname)}`);
    },
});

export const upload = multer({ storage });

export const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadChunkDir = path.join(uploadPathChunks, req.body.uploadId);
        fs.mkdirSync(uploadChunkDir, { recursive: true });
        cb(null, uploadChunkDir);
    },
    filename: (req, file, cb) => {
        const filename = `chunk_${req.body.chunkIndex}`;
        console.log(filename);
        cb(null, filename);
    },
});

export const videoUpload = multer({
    storage: videoStorage,
    limits: {
        fileSize: 500 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype.startsWith("video/") ||
            file.mimetype === "application/octet-stream"
        ) {
            cb(null, true);
        } else {
            cb(
                new ApiError(
                    400,
                    "Not a video file. Please upload only videos."
                )
            );
        }
    },
});
