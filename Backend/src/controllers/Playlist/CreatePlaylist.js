import {asyncHandler} from "../../utils/asyncHandler.js"
import {Playlist} from "../../models/playlist.model.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const CreatePlaylist = asyncHandler(async(req , res) =>{
    const {name ,isPrivate} = req.body;

    if(!name) throw new ApiError(404,"Playlist name is required");
    const userId = req.user?._id;

    if(!userId) throw new ApiError(401,"User must Logged in");

    const playlistObj = {
        name:name,
        isprivate : isPrivate,
        owner : userId
    }

    const PlaylistDoc = await Playlist.create(playlistObj);

    return res.status(201).json(new Response(201,"Playlist Created" , PlaylistDoc));
})