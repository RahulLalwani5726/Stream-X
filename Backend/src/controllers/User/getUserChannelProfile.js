import { User } from "../../models/User.model.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import {Response} from "../../utils/Response.js"
export const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) throw new ApiError(404, "Invalid Url or Channel Not found");

    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscirptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscirptions",
                localField: "_id",
                foreignField: "subcriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subcribersCount: {
                    $size: "$subscribers"
                },
                subcribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubcribed: {
                    $cond: {
                        if: {
                            $in:[req.user?._id , "$subscribers.subcriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                _id:1,
                fullname:1,
                username:1,
                avatar:1,
                coverimage:1,
                email:1,
                isSubcribed:1,
                subcribersCount:1,
                subcribedToCount:1,
                subscribers:1,
                subscribedTo:1
            }
        }
    ])

    if(!channel || !channel.length) throw new ApiError(404,"User not Found");
    return res.status(201).json(new Response(201,"User Channel Fetched Success" , channel[0]));
    
})