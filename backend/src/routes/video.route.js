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
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); 

router
    .route("/")
    .get(getAllHomeVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
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