import { Router } from 'express';
import {
    createPlaylist,
    deletePlaylist,
    getCurrentUserPlaylists,
    getCurrentUserPlaylistsTitle,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    toggleVideoToPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").post(createPlaylist)
router.route("/current-user").get(getCurrentUserPlaylists);
router.route("/current-user/t").get(getCurrentUserPlaylistsTitle);

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

router.route("/toggle/:videoId/:playlistId").patch(toggleVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router