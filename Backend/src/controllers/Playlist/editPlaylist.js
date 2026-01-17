import {asyncHandler} from "../../utils/asyncHandler.js"
import {Playlist} from "../../models/playlist.model.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";


export const editPlaylist = asyncHandler(async(req , res) =>{
    const {playlistId} = req.params;
    
    const {name , discription , isprivate} = req.body;
    // console.log(name , discription , isprivate);
    if(!playlistId) throw new ApiError(404 , "PlayList Not Found");
    if(!name && !discription) throw new ApiError(404 , "Data Is Empty");

    const playList = await Playlist.findById(playlistId);
    if(!playList) throw new ApiError(404 , "Playlist Not Found");
    if(isprivate !== undefined){
        playList.isprivate = isprivate;
    }
    if(discription){
        playList.discription = discription;
    }
    if(name){
        playList.name = name;
    }

    await playList.save();
    // console.log(playList);
    
    return res
    .status(200)
    .json(new Response(200 , "Playlist Updated" , playList));
})
