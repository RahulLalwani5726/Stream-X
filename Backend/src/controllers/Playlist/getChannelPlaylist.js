import { asyncHandler } from "../../utils/asyncHandler.js"
import { Playlist } from "../../models/playlist.model.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import mongoose from "mongoose";

export const getChannelPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    if (!userId) throw new ApiError(401, "User must be Logged in");
    const playlists = await Playlist.aggregate([
        {
            $match: {
                 owner: new mongoose.Types.ObjectId(userId) ,
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerData",
                pipeline: [
                    { $project: { username: 1, avatar: 1 } }
                ]
            }
        },
        { $unwind: "$ownerData" },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $group: {
                _id: "$owner",                 
                owner: { $first: "$ownerData" },
                playlists: { $push: "$$ROOT" }
            }
        }
    ]);


    if (!playlists) throw new ApiError(404, "No Playlist Found");

    return res.status(201).json(new Response(201, "Playlists Found", playlists[0]));
})