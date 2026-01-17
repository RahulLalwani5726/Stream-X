import { asyncHandler } from "../../utils/asyncHandler.js"
import { Comment } from "../../models/comments.model.js"
import { Response } from "../../utils/Response.js";
import mongoose from "mongoose";

export const commentList = asyncHandler(async (req, res) => {
    // Fix: use 'id' instead of 'video_id' to match the route parameter
    const entityId = req.params.id;
    
    // Convert user_id to STRING for comparison in aggregation
    const user_id = req.user?._id ? req.user._id.toString() : null;
    
    console.log("=== DEBUG INFO ===");
    console.log("req.user:", req.user);
    console.log("req.user._id:", req.user?._id);
    console.log("user_id:", user_id);
    console.log("user_id type:", typeof user_id);
    console.log("==================");

    const { type } = req.query;

    if (!entityId) {
        throw new ApiError(400, "Entity ID is required");
    }

    const matchStage = {};
    const objectId = new mongoose.Types.ObjectId(entityId);

    // Dynamic matching based on type
    if (type === "video") {
        matchStage.video = objectId;
    } else if (type === "tweet") {
        matchStage.tweet = objectId;
    } else {
        matchStage.$or = [{ video: objectId }, { tweet: objectId }];
    }

    const comments = await Comment.aggregate([
        {
            $match: matchStage
        },
        // Lookup Owner Details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        // Lookup Likes for parent comment
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likesList",
            },
        },
        // Add fields for parent comment
        {
            $addFields: {
                isLiked: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: "$likesList",
                                    as: "like",
                                    cond: { $eq: ["$like.likeBy", user_id] }
                                }
                            }
                        },
                        0
                    ]
                },
                likes: { $size: "$likesList" },
            },
        },
        // Use $graphLookup for nested replies
        {
            $graphLookup: {
                from: "comments",
                startWith: "$_id",
                connectFromField: "_id",
                connectToField: "comment",
                as: "allReplies",
                maxDepth: 10,
                depthField: "depth"
            }
        },
        // Project final fields for parent
        {
            $project: {
                content: 1,
                owner: 1,
                createdAt: 1,
                updatedAt: 1,
                likes: 1,
                isLiked: 1,
                allReplies: 1,
                likesList: 1  // Include likesList for debugging
            }
        },
        // Sort by newest first
        {
            $sort: { createdAt: -1 }
        }
    ]);

    // Calculate isLiked in JavaScript (more reliable than aggregation)
    comments.forEach(comment => {
        if (user_id && comment.likesList && comment.likesList.length > 0) {
            comment.isLiked = comment.likesList.some(like => 
                like.likeBy.toString() === user_id
            );
        } else {
            comment.isLiked = false;
        }
    });


    // Process each comment to build nested structure
    const processedComments = await Promise.all(
        comments.map(async (comment) => {
            if (comment.allReplies && comment.allReplies.length > 0) {
                const replyIds = comment.allReplies.map(r => r._id);

                const repliesWithDetails = await Comment.aggregate([
                    {
                        $match: {
                            _id: { $in: replyIds }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                { $project: { username: 1, avatar: 1 } }
                            ]
                        }
                    },
                    { $unwind: "$owner" },
                    {
                        $lookup: {
                            from: "likes",
                            localField: "_id",
                            foreignField: "comment",
                            as: "likesList",
                        }
                    },
                    {
                        $addFields: {
                            isLiked: {
                                $gt: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: "$likesList",
                                                as: "like",
                                                cond: { $eq: ["$like.likeBy", user_id] }
                                            }
                                        }
                                    },
                                    0
                                ]
                            },
                            likes: { $size: "$likesList" },
                        }
                    },
                    {
                        $project: {
                            content: 1,
                            owner: 1,
                            createdAt: 1,
                            updatedAt: 1,
                            comment: 1,
                            likes: 1,
                            isLiked: 1
                        }
                    }
                ]);

                // Build nested structure
                const replyMap = new Map();
                repliesWithDetails.forEach(reply => {
                    replyMap.set(reply._id.toString(), { ...reply, replies: [] });
                });

                // Organize replies into nested structure
                const rootReplies = [];
                repliesWithDetails.forEach(reply => {
                    const replyNode = replyMap.get(reply._id.toString());

                    if (reply.comment) {
                        const parentId = reply.comment.toString();
                        const parentNode = replyMap.get(parentId);

                        if (parentNode) {
                            parentNode.replies.push(replyNode);
                        } else if (parentId === comment._id.toString()) {
                            rootReplies.push(replyNode);
                        }
                    }
                });

                // Sort replies by createdAt
                const sortReplies = (replies) => {
                    replies.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    replies.forEach(reply => {
                        if (reply.replies && reply.replies.length > 0) {
                            sortReplies(reply.replies);
                        }
                    });
                };
                sortReplies(rootReplies);

                comment.replies = rootReplies;
                comment.repliesCount = repliesWithDetails.length;
            } else {
                comment.replies = [];
                comment.repliesCount = 0;
            }

            delete comment.allReplies;
            return comment;
        })
    );

    return res
        .status(200)
        .json(new Response(200, "Comments List Fetched", processedComments));
});