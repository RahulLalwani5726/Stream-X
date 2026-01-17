import {asyncHandler} from "../../utils/asyncHandler.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import { Tweet } from "../../models/tweets.model.js";

export const getUserTweetList = asyncHandler(async (req, res) => {
    const user_Id = req.user._id;

    const TweetsObj = await Tweet.aggregate([
        {
            $match:{
                owner:user_Id,
            }
        },
        {
            $lookup:{
                from :"likes",
                localField:"_id",
                foreignField:"tweet",
                as:"LikeList"
            }
        },
        {
            $addFields:{
                likes: {$size:"$LikeList"}
            }
        },
        {
            $project:{
                LikeList:0
            }
        }
    ])
    if (!TweetsObj) throw new ApiError(404, "No Tweets Found");
    return res.status(201).json(new Response(201, "Tweets Fetched success", TweetsObj));
})

