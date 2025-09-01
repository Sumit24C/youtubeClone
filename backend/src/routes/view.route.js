import { Router } from 'express';
import { addVideoView, getVideoView } from '../controllers/view.controller.js';
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").post(addVideoView).get(getVideoView);

export default router