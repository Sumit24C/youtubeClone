import { Router } from 'express';
import {
    deleteVideo,
    getAllHomeVideos,
    getChannelVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    getSearchVideos,
    getSearchQuery,
    publishVideoSubtitle,
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
        publishAVideo
    );

router.route("/search").get(getSearchVideos);
router.route("/q").get(getSearchQuery);

router.route("/c/:username").get(getChannelVideos);

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(updateVideo);

router.route("/:videoId/subtitles").post(publishVideoSubtitle);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router