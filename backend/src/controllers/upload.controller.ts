import { asyncHandler } from "utils/asyncHandler.js";
import { Request, Response } from "express";
import { ApiResponse } from "utils/ApiResponse.js";
import { abortMultipartUploadFromR2, generatePreSignedUploadUrl } from "services/r2.service.js";
import { ApiError } from "utils/ApiError.js";
import { videoQueue } from "queues/video.queue.js";
import {
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    UploadPartCommand,
    ListMultipartUploadsCommand,
    ListPartsCommand
} from "@aws-sdk/client-s3";
import path, { parse } from "path";
import { r2 } from "config/r2.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { redis } from "config/redis.js";

export const initMultipartUpload = asyncHandler(async (req: Request, res: Response) => {
    const { filename, contentType, videoId } = req.body;

    if (!filename || !contentType || !videoId) {
        throw new ApiError(400, "filename, videoId and contentType are required");
    }

    const key = `videos/${videoId}/original${path.extname(filename)}`;

    const command = new CreateMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        ContentType: contentType,
    });

    const response = await r2.send(command);
    await redis.set(
        `upload:${videoId}`,
        JSON.stringify({
            uploadId: response.UploadId,
            key,
        }),
        "EX",
        60 * 60
    );

    return res.json(
        new ApiResponse(
            200,
            {
                uploadId: response.UploadId,
                videoKey: key,
                videoId,
            },
            "initiated multipart upload"
        )
    );
});

export const getPartUploadUrls = async (req: Request, res: Response) => {
    const { uploadId, key, PartNumber } = req.body;
    if (!uploadId || !key || !PartNumber) {
        throw new ApiError(400, "Invalid input");
    }

    const command = new UploadPartCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        PartNumber,
        UploadId: uploadId,
    });

    const url = await getSignedUrl(r2, command, { expiresIn: 300 });
    return res.json(
        new ApiResponse(200, url, "successfully created pre-signed-urls")
    );
};

export const getUploadStatus = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.params;
    const data = await redis.get(`upload:${videoId}`);
    if (!data) {
        throw new ApiError(404, "video-upload not found");
    }

    const parsed = JSON.parse(data);

    const { uploadId, key } = parsed;

    const command = new ListPartsCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        UploadId: uploadId,
    });

    const response = await r2.send(command);

    const uploadedParts = (response.Parts || []).map((p) => ({
        PartNumber: p.PartNumber!,
        ETag: p.ETag!.replace(/"/g, ""),
    }));

    return res.json(
        new ApiResponse(
            200,
            {
                uploadId,
                key,
                uploadedParts,
            },
            "fetched upload status from R2"
        )
    );
});

export const completeMultipartUpload = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.body;
    const data = await redis.get(`upload:${videoId}`);
    if (!data) {
        throw new ApiError(404, "Upload session not found");
    }

    const parsed = JSON.parse(data);
    const { uploadId, key } = parsed;

    const listCommand = new ListPartsCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        UploadId: uploadId,
    });

    const listResponse = await r2.send(listCommand);

    const parts = (listResponse.Parts || [])
        .map((p) => ({
            PartNumber: p.PartNumber!,
            ETag: p.ETag!.replace(/"/g, ""),
        }))
        .sort((a, b) => a.PartNumber - b.PartNumber);

    if (parts.length === 0) {
        throw new ApiError(400, "No uploaded parts found in R2");
    }

    for (let i = 1; i <= parts.length; i++) {
        if (!parts.find((p) => p.PartNumber === i)) {
            throw new ApiError(400, `Missing part ${i}`);
        }
    }

    const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
    });

    try {
        await r2.send(completeCommand);
    } catch (err) {
        console.error("Complete upload failed:", err);
        throw new ApiError(500, "Failed to complete upload");
    }

    await videoQueue.add("process-video", {
        key,
        videoId,
    });

    await redis.del(`upload:${videoId}`);

    return res.json(new ApiResponse(200, null, "Upload completed"));
}
);

export const abortMultipartUpload = async (req: Request, res: Response) => {
    const { uploadId, key, videoId } = req.body;
    if (!uploadId || !key || !videoId) {
        throw new ApiError(400, "uploadId, videoId and key are required");
    }

    await abortMultipartUploadFromR2(uploadId, key, videoId);

    return res.json(new ApiResponse(200, null, "aborted multipart upload"));
};

export const getUploadUrl = async (req: Request, res: Response) => {
    const { videoId } = req.params;
    if (!videoId || typeof videoId !== "string") {
        throw new ApiError(400, "videoId is required");
    }

    const { filename, contentType, folderName, language } = req.body;

    if (!filename || !contentType || !folderName) {
        throw new ApiError(400, "filename, folderName and contentType are required");
    }

    const allowedFolders = ["thumbnail", "subtitles"];
    if (!allowedFolders.includes(folderName)) {
        throw new ApiError(400, "Invalid folderName");
    }

    let folder = folderName;

    if (folderName === "subtitles") {
        if (!language || typeof language !== "string") {
            throw new ApiError(400, "language is required for subtitles");
        }
        folder = `${folderName}/${language}`;
    }

    const data = await generatePreSignedUploadUrl(
        filename,
        contentType,
        videoId,
        folder
    );

    return res.json(
        new ApiResponse(200, data, "successfully created signed-url")
    );
};

export const listMultipartUploads = asyncHandler(async (req: Request, res: Response) => {
    const { videoId } = req.query;

    const command = new ListMultipartUploadsCommand({
        Bucket: process.env.R2_BUCKET!,
    });

    const response = await r2.send(command);

    let uploads = response.Uploads || [];

    if (videoId) {
        uploads = uploads.filter((u) =>
            u.Key?.includes(`videos/${videoId}`)
        );
    }

    return res.json(
        new ApiResponse(
            200,
            uploads.map((u) => ({
                uploadId: u.UploadId,
                key: u.Key,
                initiated: u.Initiated,
            })),
            "Active multipart uploads fetched"
        )
    );
});