import { asyncHandler } from "../../utils/asyncHandler.js"
import { User } from "../../models/User.model.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const updateHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const videoId = req.params.video_id;
    if (!userId || !videoId) throw new ApiError(404, "User Must be Logged in or Video Not Found");
    const user = await User.findByIdAndUpdate(
        userId,
        [
            {
                $set: {
                    watchHistory: {
                        $concatArrays: [
                            {
                                $filter: {
                                    input: "$watchHistory",
                                    as: "v",
                                    cond: { $ne: ["$$v", videoId] }
                                }
                            },
                            [videoId]
                        ]
                    }
                }
            }
        ],
        { new: true }
    ).select("-password -refreshtoken");

    if (!user) throw new ApiError(501, "Unable to Update watchHistory");
    return res
        .status(201)
        .json(new Response(
            201,
            "watchHistory Updated",
            user
        ))
})