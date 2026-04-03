import { Router } from 'express';
import {
    getSubscribedChannels,
    getSubscribedChannelsVideos,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); 

router
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

router.route("/u").get(getSubscribedChannels);
router.route("/u/v").get(getSubscribedChannelsVideos);

export default router