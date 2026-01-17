import {asyncHandler} from "../../utils/asyncHandler.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import { Tweet } from "../../models/tweets.model.js";
import { deleteOnCloudinary } from "../../utils/cloudinary.js";

export const deleteTweet = asyncHandler(async(req,res) =>{
    const tweetId = req.params.tweetId;

    const TweetObj = await Tweet.findById(tweetId);
    if(!TweetObj) throw new ApiError(404 , "Tweet Not Found");
    if(TweetObj.image){
        deleteOnCloudinary(TweetObj.image);
    }

    const delTweet = await Tweet.findByIdAndDelete(tweetId);

    if(!delTweet) throw new ApiError(501,"Somthing went Wrong while Deleting Tweet");

    return res.status(201).json(new Response(201,"Tweet Deleted"));
})