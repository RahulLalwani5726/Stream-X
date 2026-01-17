import { User } from "../../models/User.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Response } from "../../utils/Response.js";
import mongoose from "mongoose";

export const getWatchHistory = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(404, "User not Found");
    }

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                let: {
                    watchList: {
                        $map: {
                            input: "$watchHistory",
                            as: "id",
                            in: { $toObjectId: "$$id" }
                        }
                    }
                },
                pipeline: [
                    {
                        $match: {
                            $expr: { $in: ["$_id", "$$watchList"] }
                        }
                    },
                    {
                        $addFields: {
                            watchIndex: {
                                $indexOfArray: ["$$watchList", "$_id"]
                            }
                        }
                    },
                    {
                        $sort: { watchIndex: -1 } // most recent first
                    },
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            pipeline:[
                                {
                                    $project:{
                                        avatar:1,
                                        username:1,
                                        _id:1
                                    }
                                }
                            ],
                            as:"owner"
                        }
                    }
                ],
                as: "watchHistory"
            }
        },
        {
            $project: {
                watchHistory: 1
            }
        }
    ]);

    return res.status(200).json(
        new Response(
            200,
            "Watch History Fetched Successfully",
            user[0]
        )
    );
});
