import { asyncHandler } from "utils/asyncHandler.js";
import { Request, Response } from "express";
import { ApiResponse } from "utils/ApiResponse.js";
import { abortMultipartUploadFromR2, generateThumbnailUploadUrl } from "services/r2.service.js";
import { ApiError } from "utils/ApiError.js";
import { videoQueue } from "queues/video.queue.js";
import {
    AbortMultipartUploadCommand,
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    UploadPartCommand,
} from "@aws-sdk/client-s3";
import path from "path";
import { r2 } from "config/r2.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { redis } from "config/redis.js";

export const initMultipartUpload = asyncHandler(
    async (req: Request, res: Response) => {
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
                parts: [],
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
    }
);

export const getPartUploadUrls = async (req: Request, res: Response) => {
    const { uploadId, key, partNumbers } = req.body;
    if (!uploadId || !key || !Array.isArray(partNumbers)) {
        throw new ApiError(400, "Invalid input");
    }

    const urls = await Promise.all(
        partNumbers.map(async (partNum: number) => {
            const command = new UploadPartCommand({
                Bucket: process.env.R2_BUCKET!,
                Key: key,
                PartNumber: partNum,
                UploadId: uploadId,
            });

            const url = await getSignedUrl(r2, command, { expiresIn: 300 });
            return { url, partNum };
        })
    );

    return res.json(
        new ApiResponse(200, urls, "successfully created pre-signed-urls")
    );
};

export const saveUploadedPart = async (req: Request, res: Response) => {
    const { videoId, PartNumber, ETag } = req.body;
    if (!videoId || !PartNumber || !ETag) {
        throw new ApiError(400, "missing fields");
    }

    const data = await redis.get(`upload:${videoId}`);
    if (!data) {
        return res.status(404).json({ error: "Upload session not found" });
    }

    const parsed = JSON.parse(data);
    interface Parts {
        PartNumber: number;
        ETag: string;
    }

    const exists = parsed.parts.find((p: Parts) => p.PartNumber === PartNumber);
    if (!exists) {
        parsed.parts.push({ PartNumber, ETag });
    }

    await redis.set(`upload:${videoId}`, JSON.stringify(parsed));

    return res.json(
        new ApiResponse(200, null, "successfully saved upload-part")
    );
};

export const getUploadStatus = async (req: Request, res: Response) => {
    const { videoId } = req.params;

    const data = await redis.get(`upload:${videoId}`);
    if (!data) {
        throw new ApiError(404, "video-upload not found");
    }

    const parsed = JSON.parse(data);

    return res.json(
        new ApiResponse(
            200,
            {
                uploadId: parsed.uploadId,
                key: parsed.key,
                uploadedParts: parsed.parts,
            },
            "fetched upload status"
        )
    );
};

export const completeMultipartUpload = asyncHandler(
    async (req: Request, res: Response) => {
        const { videoId } = req.body;

        const data = await redis.get(`upload:${videoId}`);
        if (!data) {
            throw new ApiError(404, "Upload session not found");
        }

        const parsed = JSON.parse(data);
        console.log(parsed);

        if (!parsed.parts || parsed.parts.length === 0) {
            throw new ApiError(400, "No uploaded parts found");
        }

        interface Parts {
            PartNumber: number;
            ETag: string;
        }

        const parts = parsed.parts
            .map((p: Parts) => ({
                PartNumber: p.PartNumber,
                ETag: p.ETag.replaceAll('"', ""),
            }))
            .sort((a: Parts, b: Parts) => a.PartNumber - b.PartNumber);

        for (let i = 1; i <= parts.length; i++) {
            if (!parts.find((p: Parts) => p.PartNumber === i)) {
                throw new ApiError(400, `Missing part ${i}`);
            }
        }

        const command = new CompleteMultipartUploadCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: parsed.key,
            UploadId: parsed.uploadId,
            MultipartUpload: { Parts: parts },
        });

        try {
            await r2.send(command);
        } catch (err) {
            console.error("Complete upload failed:", err);
            throw new ApiError(500, "Failed to complete upload");
        }

        await videoQueue.add("process-video", {
            key: parsed.key,
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

    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
        throw new ApiError(400, "filename and contentType are required");
    }

    const data = await generateThumbnailUploadUrl(filename, contentType, videoId);
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