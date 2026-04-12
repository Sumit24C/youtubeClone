import {
  initMultipartUpload,
  getPartUploadUrls,
  saveUploadedPart,
  getUploadStatus,
  completeMultipartUpload,
  abortMultipartUpload,
  getUploadUrl,
} from "controllers/upload.controller.js";

import { Router } from "express";

const router = Router();

router.post("/pre-signed-url/:videoId", getUploadUrl);
router.post("/init-multipart", initMultipartUpload);
router.post("/get-part-urls", getPartUploadUrls);
router.post("/save-part", saveUploadedPart);
router.get("/upload-status/:videoId", getUploadStatus);
router.post("/complete-upload", completeMultipartUpload);
router.post("/abort-upload", abortMultipartUpload);

export default router;