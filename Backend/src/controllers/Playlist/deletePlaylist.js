import {asyncHandler} from "../../utils/asyncHandler.js"
import {Playlist} from "../../models/playlist.model.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const deletePlaylist = asyncHandler(async(req,res) =>{

   const {PlaylistId} = req.params;

    const isDeleted = await Playlist.findByIdAndDelete(PlaylistId);

    if(!isDeleted) throw new ApiError(501,"Unable to delete Video");
    return res.status(201).json(new Response(201,"Playlist Deleted"));
})