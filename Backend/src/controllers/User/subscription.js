import { Subscirption } from "../../models/Subsciption.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import { User } from "../../models/User.model.js";

export const subscripion = asyncHandler(async (req, res) => {
    const user_id = req.user?._id;
    const username = req.params.username;

    if (!username) throw new ApiError(404, "Channel Not Found");
    if (!user_id) throw new ApiError(404, "User must be LogedIn");
    const channel = await User.findOne({
        username: username
    });

    const isAlreadyExits = await Subscirption.findOne({
        subcriber: user_id,
        channel: channel._id
    });
    if (isAlreadyExits) {
        const UnSubscription = await Subscirption.findOneAndDelete({
            subcriber: user_id,
            channel: channel._id
        });
        return res
            .status(201)
            .json(
                new Response(201, "User UnSubscribes Successfull", { UnSubscription })
            )
    }

    const subscripionObj = {
        subcriber: user_id,
        channel: channel._id
    }
    const subscripion = await Subscirption.create(subscripionObj);

    if (!subscripion) throw new ApiError(501, "Unable to subscribe Server Error")
    return res
        .status(201)
        .json(
            new Response(201, "User Subscribes Successfull", { subscripion, isSubscribed: true })
        )
})