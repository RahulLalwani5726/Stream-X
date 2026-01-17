import {asyncHandler} from "../../utils/asyncHandler.js"
import {Video} from "../../models/video.model.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import { deleteOnCloudinary } from "../../utils/cloudinary.js";

export const deleteVideo = asyncHandler(async(req , res) =>{
        const video_id = req.params.video_id;
        const userId = req.user._id;
    
        if(!video_id || !userId) throw new ApiError(404,"Video title required or user must be login ");
        const videoObj = await Video.findById(video_id);
        if(!videoObj) throw new ApiError(404 , "Video Not Found");
        await deleteOnCloudinary(videoObj.src);
        const isVideoDelete = await Video.findByIdAndDelete(video_id); 
        if(!isVideoDelete) throw new ApiError(404,"Unable to Delete Video");
    
        return res.status(201)
        .json(
            new Response(201 , "Video Delete Successful")
        );  
})