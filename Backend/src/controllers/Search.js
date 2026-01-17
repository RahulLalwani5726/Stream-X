import { Video } from "../models/video.model.js"
import { User } from "../models/User.model.js"
import { Tweet } from "../models/tweets.model.js";
import { Playlist } from "../models/playlist.model.js"

import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Response } from "../utils/Response.js";
import mongoose from "mongoose";


export const Search = asyncHandler(async (req, res) => {
    const { query } = req.query;
    const user_id = new mongoose.Types.ObjectId(req.user._id);
    if (!query || query.trim() === "") {
        throw new ApiError(400, "Search query is required");
    }
    const userSearch = await User.aggregate([
        {
            $match: {
                $or: [
                    { username: query },
                    { fullname: query }
                ]
            }
        },
        {
            $lookup: {
                from: "subscirptions",
                localField: "_id",
                foreignField: "channel",
                as: "SubsList"
            }
        },
        {
            $addFields: {
                "isSubscribed": {
                    $cond: {
                        if: { $in: [user_id, "$SubsList.subcriber"] },
                        then: true,
                        else: false
                    }
                },
                "SubscriberCount": {
                    $size: "$SubsList"
                }
            }
        },
        {
            $project: {
                SubsList: 0
            }
        }
    ])
    const videoSearch = await Video.aggregate([
        {
            $match: {
                $or: [
                    { title: query },
                    { discription: query },
                    { owner: query }
                ]
            }
        },
        {
            $lookup: {
                from: "users",
                let: { videoId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: [
                                    "$$videoId",
                                    {
                                        $map: {
                                            input: "$watchHistory",
                                            as: "v",
                                            in: { $toObjectId: "$$v" }
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1
                        }
                    },
                ],
                as: "viewsList"
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
                            _id: 1,
                            avatar: 1,
                            username: 1,
                        }
                    }
                ],
                as: "owner"
            }
        },
        {
            $addFields: {
                views: { $size: "$viewsList" }
            }
        },
        {
            $project: {
                viewsList: 0
            }
        }
    ])
    const tweetSearch = await Tweet.aggregate([
        {
            $match: {
                $or: [
                    { owner: query },
                    { content: query }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "LikeList"
            }
        },
        {
            $addFields: {
                likes: { $size: "$LikeList" },
                isLiked: {
                    $cond: {
                        if: {
                            $expr: {
                                $in: [
                                    user_id,
                                    {
                                        $map: {
                                            input: "$LikeList.likeBy",
                                            as: "v",
                                            in: { $toObjectId: "$$v" }
                                        }
                                    }
                                ]
                            }
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                LikeList: 0
            }
        }
    ])
    const playlistSearch = await Playlist.aggregate([
        {
            $match: {
                $or: [
                    { owner: user_id },
                    { isprivate: false }
                ],
                $or: [
                    { name: query },
                    { discription: query }
                ]
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            thumbnail: 1,
                            title: 1,
                        }
                    }
                ],
                as: "videos"
            }
        }
    ])

    const response = {};
    response.videos = videoSearch;
    response.user = userSearch;
    response.tweetSearch = tweetSearch;
    response.playlist = playlistSearch;

    return res
        .status(200)
        .json(new Response(200, "Search Full Filed", response));
})