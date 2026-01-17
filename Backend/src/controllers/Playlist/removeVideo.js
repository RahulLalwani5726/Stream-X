import { asyncHandler } from "../../utils/asyncHandler.js"
import { Playlist } from "../../models/playlist.model.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";


export const removeVideo = asyncHandler(async (req, res) => {
    const {PlaylistId , videoId}  = req.params;

    const playlistDoc = await Playlist.findById(PlaylistId)

    if (!playlistDoc) throw new ApiError(404, "Unable to find Playlist");

    playlistDoc.videos = playlistDoc.videos.filter((video) => video != videoId)

    await playlistDoc.save();

    const newPlaylist = await Playlist.findById(playlistDoc._id);

    return res.status(201).json(new Response(201,"Video Removed",newPlaylist));
})