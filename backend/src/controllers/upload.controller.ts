import { asyncHandler } from "utils/asyncHandler.js";
import { Request, Response } from "express";
import { createUploadSession } from "services/upload.service.js";
import { ApiResponse } from "utils/ApiResponse.js";

export const startUpload = asyncHandler(async (req: Request, res: Response) => {
    const result = await createUploadSession();

    return res.json(new ApiResponse(200, result, "Upload session created"));
});
