import {asyncHandler} from "../../utils/asyncHandler.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import { Tweet } from "../../models/tweets.model.js";
import { UploadOnCloudinary } from "../../utils/cloudinary.js";

export const createTweets = asyncHandler(async(req , res)=>{
    const userId = req.user?._id;

    const {content} = req.body;
    let image = "";
    if (req.file && req.file.path) {
        image = req.file;
    }
    

    if(!content && !image) throw new ApiError(405,"Tweet is Empty");
    if(!userId) throw new ApiError(405,"User is not Logged in");
    let Uploadedimage = null;
    if(image){
         Uploadedimage = await UploadOnCloudinary(image.path);
    }
    const tweetObj = {
        owner:userId,
        content:content,
        image:Uploadedimage?.url
    }

    const tweet = await Tweet.create(tweetObj);
    
    if(!tweet) throw new ApiError(501,"Unable to make Tweet");

    return res.status(201).json(new Response(201,"Tweet Created",tweet));
})