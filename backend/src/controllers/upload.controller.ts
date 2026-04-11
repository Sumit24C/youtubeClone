import { asyncHandler } from "utils/asyncHandler.js";
import { Request, Response } from "express";
import { createUploadSession } from "services/upload.service.js";
import { ApiResponse } from "utils/ApiResponse.js";
import { generateUploadUrl } from "services/r2.service.js";
import { ApiError } from "utils/ApiError.js";
import { videoQueue } from "queues/video.queue.js";

export const startUpload = asyncHandler(async (req: Request, res: Response) => {
    const result = await createUploadSession();

    return res.json(new ApiResponse(200, result, "Upload session created"));
});

export const getUploadUrl = async (req: Request, res: Response) => {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
        throw new ApiError(400, "filename and contentType are required");
    }

    const data = await generateUploadUrl(filename, contentType);
    return res.json(
        new ApiResponse(200, data, "successfully created signed-url")
    );
};

export const processVideo = async (req: Request, res: Response) => {
    const { key, videoId } = req.body;

    if (!key || !videoId) {
        throw new ApiError(400, "key and videoId are required");
    }

    await videoQueue.add("process-video", {
        key,
        videoId,
    });

    return res.json(
        new ApiResponse(200, null, "successfully created signed-url")
    );
};
