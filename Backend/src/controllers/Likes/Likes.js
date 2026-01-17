import { asyncHandler } from "../../utils/asyncHandler.js";
import { Response } from "../../utils/Response.js";
import { ApiError } from "../../utils/ApiError.js";
import { Like } from "../../models/likes.model.js";
import mongoose from "mongoose";

export const toggleLike = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { type } = req.body; 
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid ID");
    }

    let query = { likeBy: userId };

    if (type === "video") {
        query.video = id;
    } else if (type === "comment") {
        query.comment = id;
    } else if (type === "tweet") {
        query.tweet = id;
    } else {
        throw new ApiError(400, "Invalid type. Must be 'video', 'comment', or 'tweet'");
    }

   
    const existingLike = await Like.findOne(query);
    
    let isLiked = false;

    if (existingLike) {
    
        await Like.findByIdAndDelete(existingLike._id);
        isLiked = false;
    } else {
     
        const newLike = await Like.create(query);
        if (!newLike) {
            throw new ApiError(500, "Something went wrong while liking");
        }
        isLiked = true;
    }

   
    return res
        .status(200)
        .json(
            new Response(
                200, 
                isLiked ? "Liked successfully" : "Unliked successfully", 
                { isLiked } 
            )
        );
});