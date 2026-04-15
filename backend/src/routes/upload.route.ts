import {
  initMultipartUpload,
  getPartUploadUrls,
  getUploadStatus,
  completeMultipartUpload,
  abortMultipartUpload,
  getUploadUrl,
  listMultipartUploads,
} from "controllers/upload.controller.js";

import { Router } from "express";

const router = Router();

router.post("/pre-signed-url/:videoId", getUploadUrl);

router.post("/init-multipart", initMultipartUpload);
router.post("/get-part-urls", getPartUploadUrls);

router.get("/upload-status/:videoId", getUploadStatus);

router.post("/complete-upload", completeMultipartUpload);
router.post("/abort-upload", abortMultipartUpload);

router.post("/ongoing-uploads/:videoId", listMultipartUploads);

export default router;