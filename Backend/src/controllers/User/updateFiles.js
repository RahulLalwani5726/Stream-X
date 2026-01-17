import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { Response } from "../../utils/Response.js";
import { UploadOnCloudinary, deleteOnCloudinary } from "../../utils/cloudinary.js";

// --- Update Avatar ---
export const updateAvatar = asyncHandler(async (req, res) => {
    const avatarPath = req.file?.path;
    
    if (!avatarPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    // 1. Upload new image
    const avatar = await UploadOnCloudinary(avatarPath);
    if (!avatar.url) {
        throw new ApiError(500, "Error uploading avatar to Cloudinary");
    }
    // 2. Delete old image (Optional but recommended)
    // Note: Ensure req.user.avatar has the public_id or logic to extract it
    await deleteOnCloudinary(req.user.avatar);

    // 3. Update DB (ADDED 'await' HERE)
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true } // Returns the updated document
    ).select("-password");

    return res.status(200).json(
        new Response(200, "Avatar Updated Successfully", user)
    );
});

// --- Update Cover Image ---
export const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImagePath = req.file?.path;

    if (!coverImagePath) {
        throw new ApiError(400, "Cover Image file is missing");
    }

    // 1. Upload new image
    const coverImage = await UploadOnCloudinary(coverImagePath);
    if (!coverImage.url) {
        throw new ApiError(500, "Error uploading cover image");
    }

    // 2. Delete old image
    await deleteOnCloudinary(req.user?.coverImage);

    // 3. Update DB (ADDED 'await' HERE)
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverimage: coverImage.url // Ensure Schema uses 'coverImage' (camelCase)
            }
        },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new Response(200, "Cover Image Updated Successfully", user)
    );
});