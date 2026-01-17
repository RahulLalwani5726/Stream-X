import {asyncHandler} from "../../utils/asyncHandler.js"
import {Playlist} from "../../models/playlist.model.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const addVideo = asyncHandler(async(req , res) =>{
    const {videoId , PlaylistId} = req.params;
    if(!videoId && !PlaylistId) throw new ApiError(404,"Video or playlist Id is required");

    const playlistDoc = await Playlist.findByIdAndUpdate({
        _id:PlaylistId
    },{
        $push:{videos:videoId}
    },{new:true});
    
    if(!playlistDoc) throw new ApiError(501,"Unable to add Video into playlist");

    return res.status(201).json(new Response(201,"Video added",playlistDoc));
})