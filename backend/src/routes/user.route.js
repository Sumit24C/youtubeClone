import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelInfo,
    getWatchHistory,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
} from "../controllers/user.controller.js";
import { upload } from '../middlewares/multer.middleware.js'
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1,
        },
        {
            name: 'coverImage',
            maxCount: 1,
        },
    ]),
    registerUser)

router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT, logoutUser)
router.route('/refresh-token').get(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-account-details').patch(verifyJWT, updateAccountDetails)

router.route('/update-avatar').patch(
    verifyJWT,
    upload.single('avatar'),
    updateUserAvatar)

router.route('/update-coverImage').patch(
    verifyJWT,
    upload.single('coverImage'),
    updateUserCoverImage)

router.route('/channel-profile/:username').get(verifyJWT, getUserChannelInfo)
router.route('/watch-history').get(verifyJWT, getWatchHistory)

export default router