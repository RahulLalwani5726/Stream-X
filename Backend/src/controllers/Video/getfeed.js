import { asyncHandler } from "../../utils/asyncHandler.js"
import { Video } from "../../models/video.model.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const getFeedVideo = asyncHandler(async (req, res) => {
    const videoObj = await Video.aggregate([
        {
            $match: {
                isPublish: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            fullname:1,
                            username:1,
                            
                        }
                    }
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
                    { $project: { _id: 1 } },
                ],
                as: "viewsList"
            }
        },
        {
            $addFields:{
                views:{$size:"$viewsList"}
            }
        }
    ])

    if (!videoObj) throw new ApiError(404, "Collection is empty");
    return res.status(201).json(new Response(201, "Matching Success", videoObj));
})