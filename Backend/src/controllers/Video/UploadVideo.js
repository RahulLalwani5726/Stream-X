import {asyncHandler} from "../../utils/asyncHandler.js"
import {Video} from "../../models/video.model.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import {UploadOnCloudinary} from "../../utils/cloudinary.js"

export const uploadViedo = asyncHandler(async(req , res) =>{

    try {
        const localVideoSrc = req.files?.video[0]?.path;
        const localThumbnailsrc = req.files?.thumbnail[0]?.path;
        const {title,isPublish,discription} = req.body;
        
        if(!req.user) throw new ApiError(401,"User Not Found");
        const owner = req.user._id;
        // const owner = "6901d6707e22023e3b3e2ae7";
    
        if(!title || !isPublish) throw new ApiError(404,"Video title or Publish type is required");
    
        if(!localThumbnailsrc) throw new ApiError(404,"Thumbline is required");
        if(!localVideoSrc) throw new ApiError(404,"Video is required");
    
        const VideoSrc = await UploadOnCloudinary(localVideoSrc);
        const ThumblineSrc = await UploadOnCloudinary(localThumbnailsrc);
    
        if(!VideoSrc) throw new ApiError(501,"Somting Went Wrong while Uploding Video")
        if(!ThumblineSrc) throw new ApiError(501,"Somting Went Wrong while Uploding Thumbline")
    
        const VideoDuration = VideoSrc?.duration;
    
        const VideoObj = {
            src:VideoSrc?.url,
            owner:owner,
            thumbnail:ThumblineSrc?.url,
            title:title,
            duration:VideoDuration,
            views:0,
            isPublish:isPublish,
            discription:discription || ""
        }
        const videoRes = await Video.create(VideoObj);
    
        if(!videoRes) throw new ApiError(505,"Unable To Upload Video");
    
        return res.status(201).json(new Response(201,"Video Upload Success" , videoRes));
    } catch (error) {
        console.log("Error :: Upload Video :: ",error);  
    }
})

