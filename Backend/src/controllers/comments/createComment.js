import { asyncHandler } from "../../utils/asyncHandler.js"
import { Comment } from "../../models/comments.model.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const createComment = asyncHandler(async (req, res) => {
    // 1. Get ID from params (renamed to entityId for clarity)
    const entityId = req.params.id; 
    
    // 2. Safety check: Ensure user exists before accessing _id
    if (!req.user?._id) {
        throw new ApiError(401, "User Must be Logged In");
    }
    const userId = req.user._id;
    
    const { type, content } = req.body;

    if (!entityId) {
        throw new ApiError(404, "Resource ID not found");
    }

    // 3. Construct the comment object
    const commentObj = {
        content,
        owner: userId
    };

    // 4. Handle Polymorphic Association
    if (type === "video") {
        commentObj.video = entityId;
    } else if (type === "comment") {
        commentObj.comment = entityId; // This creates the reply
    } else if (type === "tweet") {
        commentObj.tweet = entityId;
    } else {
        throw new ApiError(400, "Comment type is not Defined or Invalid");
    }

    // 5. Create in DB
    const comment = await Comment.create(commentObj);

    if (!comment) {
        throw new ApiError(500, "Unable to Create Comment");
    }

    // 6. Return Response
    return res
        .status(201)
        .json(new Response(201, "Comment Created", comment));
});