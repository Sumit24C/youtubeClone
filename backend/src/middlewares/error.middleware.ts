import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs-extra";
import path from "path";
import multer from "multer";

import { uploadPathChunks } from "../config/upload.config.js";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "utils/ApiError.js";

const errorHandler = (
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Something went wrong";

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res
                .status(400)
                .json(
                    new ApiResponse(
                        400,
                        {},
                        "File size limit exceeded (max 500MB).",
                        err?.errors || []
                    )
                );
        }
    }

    if (err) {
        fs.readdir(uploadPathChunks, (error, files) => {
            if (error) {
                return console.error(`Unable to scan directory`, err);
            }
            // files.forEach(async (file) => {
            //     const filePath = path.join(uploadPathChunks, file);
            //     await fs.promises.unlink(filePath);
            // });
        });
    }
    
    return res
        .status(statusCode)
        .json(new ApiResponse(statusCode, {}, message, err?.errors || []));
};

export default errorHandler;
