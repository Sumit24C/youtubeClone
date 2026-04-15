import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "../config/r2.js";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";
import { Readable } from "stream";
import { ApiError } from "utils/ApiError.js";
import { redis } from "config/redis.js";

export const generatePreSignedUploadUrl = async (
    filename: string,
    contentType: string,
    videoId: string,
    folder: string = "thumbnails"
) => {
    const newFilename = `${randomUUID()}${path.extname(filename)}`;
    console.log(folder)
    const key = `videos/${videoId}/${folder}/${newFilename}`;
    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        ContentType: contentType,
    });

    const url = await getSignedUrl(r2, command, { expiresIn: 60 });
    return {
        thumbnail: { url, key },
        videoId
    };
};

export const downloadFromR2 = async (key: string, outputPath: string) => {
    const res = await r2.send(
        new GetObjectCommand({
            Bucket: process.env.R2_BUCKET!,
            Key: key,
        })
    );
    if (!(res.Body instanceof Readable)) {
        throw new ApiError(400, "Unexpected stream type");
    }

    const body = res.Body;
    return new Promise<void>((resolve, reject) => {
        const write = fs.createWriteStream(outputPath);
        body.pipe(write);
        body.on("finish", resolve);
        body.on("error", reject);
    });
};

export const deleteFromR2 = async (key: string): Promise<void> => {
    if (!key) return;

    try {
        await r2.send(
            new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET!,
                Key: key,
            })
        );
    } catch (error) {
        throw new ApiError(500, "Failed to delete file from R2");
    }
};

export const uploadFolderToR2 = async (localDir: string, baseKey: string) => {
    const walk = (dir: string): string[] =>
        fs.readdirSync(dir).flatMap((file) => {
            const p = path.join(dir, file);
            return fs.lstatSync(p).isDirectory() ? walk(p) : [p];
        });

    for (const filePath of walk(localDir)) {
        const relPath = path.relative(localDir, filePath).replace(/\\/g, "/");;
        const key = `${baseKey}/${relPath}`;
        const contentType = filePath.endsWith(".m3u8")
            ? "application/vnd.apple.mpegurl"
            : filePath.endsWith(".ts")
                ? "video/mp2t"
                : "application/octet-stream";

        await r2.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET!,
                Key: key,
                Body: fs.createReadStream(filePath),
                ContentType: contentType,
            })
        );
    }
};

export const abortMultipartUploadFromR2 = async (
    uploadId: string,
    key: string,
    videoId: string
): Promise<void> => {
    try {
        const command = new AbortMultipartUploadCommand({
            Bucket: process.env.R2_BUCKET!,
            UploadId: uploadId,
            Key: key,
        });

        await r2.send(command);

        await redis.del(`upload:${videoId}`);
    } catch (error) {
        throw new ApiError(500, "Failed to abort multipart upload");
    }
};