import { Subscirption } from "../../models/Subsciption.model.js";
import {asyncHandler} from "../../utils/asyncHandler.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const getSubscribersCount = asyncHandler(async(req,res) =>{
    const user_Id = req.user?._id;

    if(!user_Id) throw new ApiError(405,"User not found");
 
    const SubscribersCount = await Subscirption.countDocuments({channel:user_Id});

    if(!SubscribersCount) throw new ApiError(501,"Unable to find subscribers");

    return res
    .status(201)
    .json(new Response(201,"Reauest fulfilled",SubscribersCount));
})