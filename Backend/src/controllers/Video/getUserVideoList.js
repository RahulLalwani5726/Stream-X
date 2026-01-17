import { asyncHandler } from "../../utils/asyncHandler.js"
import { Video } from "../../models/video.model.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import mongoose from "mongoose";
export const getUserVideoList = asyncHandler(async (req, res) => {
    const user_Id = req.user._id;

    const videoObj = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(user_Id),
            },
        },

        // 🔹 Likes lookup
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likesList",
            },
        },


        // 🔹 Views lookup
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
                                            in: { $toObjectId: "$$v" },
                                        },
                                    },
                                ],
                            },
                        },
                    },
                    {
                        $project: { _id: 1 },
                    },
                ],
                as: "viewsList",
            },
        },

        {
            $addFields: {
                viewsCount: { $size: "$viewsList" },
                likesCount: { $size: "$likesList" },
            },
        },
        {
            $project: {
                createdAt: 1,
                discription: 1,
                duration: 1,
                isPublish: 1,
                likesCount: 1,
                owner: 1,
                src: 1,
                thumbnail: 1,
                title: 1,
                updatedAt: 1,
                views: 1,
                viewsCount: 1,
                _id: 1,
            }
        }
    ]);

    if (!videoObj) throw new ApiError(404, "No Video Found");

    return res
        .status(200)
        .json(new Response(200, "Videos fetched successfully", videoObj));
});

