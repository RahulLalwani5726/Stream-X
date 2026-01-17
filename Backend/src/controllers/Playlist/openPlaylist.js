import { asyncHandler } from "../../utils/asyncHandler.js"
import { Playlist } from "../../models/playlist.model.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import mongoose from "mongoose";

export const openPlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    
    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                pipeline: [
                    {
                        $lookup:{
                            from : "users",
                            localField:"owner",
                            foreignField:"_id",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        avatar:1,
                                        _id:1,
                                    }
                                }
                            ],
                            as:"owner"
                        }
                    },
                    {
                        $project: {
                            "src": 1,
                            "thumbnail": 1,
                            "title": 1,
                            "duration": 1,
                            "description": 1,
                            "owner":1
                        }
                    }
                ],
                as: "videos"
            },
        },
    ])
    console.log(playlist);

    if (!playlist) throw new ApiError("No Playist Videos Found");

    return res
        .status(201)
        .json(new Response(201, "Playlist Fetched", playlist[0]));
})