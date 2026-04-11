import { getUploadUrl, processVideo } from "controllers/upload.controller.js";
import { Router } from "express";

const router = Router();

router.route("/signed-url").post(getUploadUrl);
router.route("/process-video").post(processVideo);

export default router;