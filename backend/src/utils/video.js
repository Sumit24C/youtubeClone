import path from "path"
import fs from "fs-extra"
import multer from "multer";
import { ApiError } from "./ApiError.js";
import { asyncHandler } from "./asyncHandler.js"
import { ApiResponse } from "./ApiResponse.js";
const uploadPath = path.join(process.cwd, "uploads")
const uploadPathChunks = path.join(process.cwd, "chunks")

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

await fs.mkdir(uploadPath, { recursive: true });
await fs.mkdir(uploadPathChunks, { recursive: true });

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
        videoUrl: `https://xyz.com/dist/video/${fileName}`,
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
                await new Promise((res, rej) => {
                    chunkReadStream.pipe()
                })
            } catch (error) {
                
            }
        }
    }
}