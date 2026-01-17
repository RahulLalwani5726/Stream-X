import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import { Tweet } from "../../models/tweets.model.js";
import mongoose from "mongoose";

export const tweetList = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const tweetList = await Tweet.aggregate([
        {
            $lookup:{
                from :"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            _id:1,
                            avatar:1,
                            username:1,
                            fullname:1,
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "likesList"
            }

        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "tweet",
                as: "commentsList"
            }
        },
        {
            $addFields: {
                isLiked: {
                    $anyElementTrue: {
                        $map: {
                            input: "$likesList",
                            as: "like",
                            in: { $eq: ["$$like.likeBy", userId] }
                        }
                    }
                },
                likesCount: { $size: "$likesList" },
                commentCount: { $size: "$commentsList" }
            }
        },


        {
            $project: {
                commentsList: 1,
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: 1,
                updatedAt: 1,
                _id: 1,
                isLiked: 1,
                commentCount:1,
                image:1,
            }
        },
        {
            $sort: { likesCount: -1, createdAt: -1 }
        }

    ])

    if (!tweetList) throw new ApiError(405, "No tweets Are Created");
    return res
        .status(201)
        .json(new Response(201, "recents Tweets List Fetched", tweetList));
})