import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addVideo,
    CreatePlaylist,
    deletePlaylist,
    openPlaylist,
    removeVideo,
    getPlaylists,
    editPlaylist,
    getChannelPlaylists,
} from "../controllers/Playlists.js"
const playlistRoute = express.Router();

playlistRoute.route("/").get(verifyJWT, getPlaylists);
playlistRoute.route("/user/:userId").get(getChannelPlaylists);
playlistRoute.route("/add/:PlaylistId/:videoId").patch(addVideo)
playlistRoute.route("/remove/:PlaylistId/:videoId").patch(removeVideo)
playlistRoute.route("/create").post(verifyJWT, CreatePlaylist)
playlistRoute.route("/delete/:PlaylistId").delete(deletePlaylist)
playlistRoute.route("/view/:playlistId").get(openPlaylist)
playlistRoute.route("/edit/:playlistId").patch(editPlaylist)


export {
    playlistRoute
}