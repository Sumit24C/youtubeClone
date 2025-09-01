import { Router } from 'express';
import {
    deleteVideo,
    getChannelStats,
    getChannelVideos,
    getVideoAnalytics,
} from "../controllers/dashboard.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/stats").get(getChannelStats);
router.route("/videos").get(getVideoAnalytics);
router.route("/video/:videoId").delete(deleteVideo)
export default router