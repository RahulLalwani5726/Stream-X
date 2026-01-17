import {asyncHandler} from "../../utils/asyncHandler.js"
import {Comment} from "../../models/comments.model.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const editComment = asyncHandler(async(req,res) =>{
    const comment_id = req.params.comment_id;
    const user_Id = req.user._id;
    const content = req.body.content;
    if(!user_Id || !comment_id) throw new ApiError(405,"User Must be logged in or Comment Not Found");
    if(!content) throw new ApiError(404,"Comment Content is Empty");
    const updatedComment = await Comment.findOneAndUpdate({
        owner:user_Id,
        _id:comment_id
    },{
        content:content
    },{new:true});

    if(!updatedComment) throw new ApiError(501,"Somthing went wrong while Updating comment");

    return res
    .status(201)
    .json(new Response(201,"Comment Updated",updatedComment));
})