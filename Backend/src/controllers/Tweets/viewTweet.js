import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { Response } from "../../utils/Response.js";
import { Tweet } from "../../models/tweets.model.js";
import mongoose from "mongoose";

export const viewTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }

    const tweet = await Tweet.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(tweetId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            avatar: 1,
                            username: 1,
                            email: 1,
                            fullname: 1,
                            coverimage: 1,
                        },
                    },
                ],
            },
        },
    ]);

    if (tweet.length === 0) {
        throw new ApiError(404, "Tweet Not Found");
    }

    return res
        .status(200)
        .json(new Response(200, "Tweet fetched successfully", tweet[0]));
});
