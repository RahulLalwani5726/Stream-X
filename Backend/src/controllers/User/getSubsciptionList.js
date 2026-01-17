import { Subscirption } from "../../models/Subsciption.model.js";
import {asyncHandler} from "../../utils/asyncHandler.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const getSubscriptionList = asyncHandler(async(req,res) =>{
    const user_Id = req.user._id;

    if(!user_Id) throw new ApiError(405,"User not found");
    const subscriberList = await Subscirption.aggregate([
        {
            $match:{
                subcriber:user_Id
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            username:1,
                            _id:1, 
                        }
                    }
                ],
                as:"users"
            }
        }
    ])

    for(let user of subscriberList){
        if(!user.users) continue;
        const count = await Subscirption.countDocuments({channel:user.users[0]._id});
        user.users[0].subcriberCount = count;
    }
    // const subscriberList = await Subscirption.find({
    //     channel:user_Id
    // }).select("-channel");

    if(!subscriberList) throw new ApiError(501,"Unable to find subscribers");

    return res
    .status(201)
    .json(new Response(201,"subscribers List Found",subscriberList));
})