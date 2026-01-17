import { Subscirption } from "../../models/Subsciption.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const getSubscriberList = asyncHandler(async (req, res) => {
    const user_Id = req.user._id;

    if (!user_Id) throw new ApiError(405, "User not found");
    const subscriberList = await Subscirption.aggregate([
        {
            $match: {
                channel: user_Id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subcriber",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            username: 1,
                            _id: 1,
                        }
                    }
                ],
                as: "subcriber"
            }
        }
    ]);

    for (const user of subscriberList) {

        // default false
        if (user?.subcriber?.length > 0) {
            user.subcriber[0].isSubscribed = false;
        }

        // skip if no subscriber
        if (!user?.subcriber?.length) continue;

        const isSubs = await Subscirption.findOne({
            channel: user.subcriber[0]._id,
            subcriber: user_Id
        });
        user.subcriber[0].subcriberCount = await Subscirption.countDocuments({channel: user.subcriber[0]._id,})
        if (isSubs) {
            user.subcriber[0].isSubscribed = true;
        }
    }

    if (!subscriberList) throw new ApiError(501, "Unable to find subscribers");

    return res
        .status(201)
        .json(new Response(201, "subscribers List Found", subscriberList));
})