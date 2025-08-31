import { Router } from 'express';
import {
    createPlaylist,
    deletePlaylist,
    getCurrentUserPlaylists,
    getCurrentUserPlaylistsTitle,
    getPlaylistById,
    getUserPlaylists,
    toggleVideoLikePlaylist,
    toggleVideoToPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist)
router.route("/current-user").get(getCurrentUserPlaylists);
router.route("/current-user/t").get(getCurrentUserPlaylistsTitle);

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

//for use case
router.route("/toggle/l/:videoId/").patch(toggleVideoLikePlaylist);
router.route("/toggle/:videoId/:playlistId").patch(toggleVideoToPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router