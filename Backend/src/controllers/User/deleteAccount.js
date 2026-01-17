import {asyncHandler} from "../../utils/asyncHandler.js"
import {User} from "../../models/User.model.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import { deleteOnCloudinary } from "../../utils/cloudinary.js";

export const deleteAccount = asyncHandler(async(req , res) =>{
    const user = req.user;
    const userId = req.user?._id;
    if(!userId) throw new ApiError(404 , "User Not Found");
    if(user.avatar){
        deleteOnCloudinary(user.avatar);
    }
    if(user.coverimage){
        deleteOnCloudinary(user.coverimage);
    }
    const response = await User.findByIdAndDelete(userId);
    if(!response) throw new ApiError(501 , "Unable to Delete Account");
    return res
    .status(200)
    .json(new Response(200 , "Account Deleted"));
})