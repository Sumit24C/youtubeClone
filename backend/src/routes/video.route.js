import { Router } from 'express';
import {
    deleteVideo,
    getAllHomeVideos,
    getChannelVideo,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    getSearchVideos,
    getSearchQuery,
} from "../controllers/video.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { upload, videoUpload } from "../middlewares/multer.middleware.js"
import { videoUploadHandler } from '../services/video.service.js';

const router = Router();
router.use(verifyJWT);

router.route("/upload").post(
    videoUpload.single("video"),
    videoUploadHandler
);

router
    .route("/")
    .get(getAllHomeVideos)
    .post(
        upload.single("thumbnail"),
        publishAVideo
    );

router.route("/search").get(getSearchVideos);
router.route("/q").get(getSearchQuery);

router.route("/c/:username").get(getChannelVideo);

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router