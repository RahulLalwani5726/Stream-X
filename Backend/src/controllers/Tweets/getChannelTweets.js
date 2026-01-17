import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import { Tweet } from "../../models/tweets.model.js";
import mongoose from "mongoose";

export const getChannelTweets = asyncHandler(async (req, res) => {
    const user_Id = new mongoose.Types.ObjectId(req.params._id);
    const TweetsObj = await Tweet.aggregate([
        {
            $match: {
                owner: user_Id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                            _id: 1,
                        }
                    }
                ],
                as: "owner"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likeList"
            }
        },
        {
            $addFields: {
                likeCount: { $size: "$likeList" },
                isLikes: {
                    $in: [
                           user_Id,
                        {
                            $map: {
                                input: "$likeList",
                                as: "id",
                                in: {
                                    $convert: {
                                        input: "$$id.likeBy",
                                        to: "objectId",
                                        onError: null,
                                        onNull: null
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            $project:{
                likeList:0
            }
        }

    ])
    if (!TweetsObj) throw new ApiError(404, "No Tweets Found");
    console.log(TweetsObj);

    return res.status(201).json(new Response(201, "Tweets Fetched success", TweetsObj));
})

