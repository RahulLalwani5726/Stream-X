import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import { Tweet } from "../../models/tweets.model.js";

export const editTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    const newContent = req.body?.content;

    if (!newContent || newContent.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const edittweet = await Tweet.findByIdAndUpdate({
        _id: tweetId,
    }, {
        content: newContent.trim()
    }, { new: true });

    if (!edittweet) throw new ApiError(501, "Somthing went Wrong while Editing Tweet");

    return res.status(201).json(new Response(201, "Tweet Edited", edittweet));
})