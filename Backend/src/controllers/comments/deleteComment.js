import {asyncHandler} from "../../utils/asyncHandler.js"
import {Comment} from "../../models/comments.model.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
export const deleteComment = asyncHandler(async(req,res) =>{
    const comment_id = req.params?.comment_id;
    if(!comment_id) throw new ApiError(405,"User Must be logged in or Comment Not Found");
    const deleteComment = await Comment.findByIdAndDelete(comment_id);

    if(!deleteComment) throw new ApiError(501,"Somthing went wrong while Updating comment");

    return res
    .status(201)
    .json(new Response(201,"Comment Updated"));
})