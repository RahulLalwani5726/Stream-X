import { asyncHandler } from "../../utils/asyncHandler.js";
import { Video } from "../../models/video.model.js";
import { Response } from "../../utils/Response.js";
import { ApiError } from "../../utils/ApiError.js";
import mongoose from "mongoose";

export const getVideo = asyncHandler(async (req, res) => {
  const { video_id } = req.params;

  // User ID (Sirf reference ke liye, ab hum array bhej rahe hain)
  const user_id = req.user?._id ? new mongoose.Types.ObjectId(req.user._id.toString()) : null;

  const video = await Video.aggregate([
    // Match video by ID
    {
      $match: {
        _id: new mongoose.Types.ObjectId(video_id)
      }
    },

    // Count Views (Using User Watch History)
    {
      $lookup: {
        from: "users",
        let: { videoId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $in: [
                  "$$videoId",
                  {
                    $map: {
                      input: "$watchHistory",
                      as: "v",
                      in: { $toObjectId: "$$v" },
                    },
                  },
                ],
              },
            },
          },
          { $project: { _id: 1 } },
        ],
        as: "views",
      },
    },


    // Lookup Owner Details
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner"
    },

    // Get All Subscribers Data
    {
      $lookup: {
        from: "subscirptions", // Collection name (typo preserved)
        localField: "owner._id",
        foreignField: "channel",
        as: "subscribersList",
      },
    },

    // Get All Likes Data
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likesList",
      },
    },

    // Add Computed Fields (Simplified)
    // Add Computed Fields
    {
      $addFields: {
        "owner.isSubscribe": {
          $cond: {
            if: {
              $in: [
                user_id,
                "$subscribersList.subcriber" // <--- YAHAN CHANGE KIYA HAI (Database wali spelling use karein)
              ]
            },
            then: true,
            else: false
          }
        },
        isLiked: {
          $cond: {
            if: {
              $in: [
                user_id,
                "$likesList.likeBy"
              ]
            },
            then: true,
            else: false
          }
        },

        views: { $size: "$views" },
        "owner.subcribersCount": { $size: "$subscribersList" },
        likes: { $size: "$likesList" },
      },
    },
    // Final Projection
    {
      $project: {
        title: 1,
        discription: 1,
        src: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
        updatedAt: 1,
        likes: 1,
        isLiked: 1,

        owner: {
          _id: 1,
          username: 1,
          avatar: 1,
          subcribersCount: 1,
          isSubscribe: 1,
        },
      },
    },
  ]);

  if (!video.length) throw new ApiError(404, "Video not found");

  return res.status(200).json(new Response(200, "Video fetched successfully", video[0]));
});