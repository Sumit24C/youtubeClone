import fs from "fs-extra";
import path from "path";
import { randomUUID } from "crypto";
import { uploadPathChunks } from "../config/upload.config.js";

export const createUploadSession = async () => {
    const uploadId = randomUUID();

    const uploadDir = path.join(uploadPathChunks, uploadId);
    await fs.mkdir(uploadDir, { recursive: true });

    return { uploadId };
};
