import { asyncHandler } from "../../utils/asyncHandler.js"
import { Video } from "../../models/video.model.js"
import { ApiError } from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";
import { UploadOnCloudinary } from "../../utils/cloudinary.js"
import mongoose from "mongoose";

export const updateVideoFields = asyncHandler(async (req, res) => {
    try {
        const video_id = req.params.video_id;
        const userId = req.user._id;
        const localThublinePath = req.file?.path;
        if (!video_id || !userId) throw new ApiError(404, "Video title required or user must be login ");

        const { title, isPublish, discription } = req.body;

        const videoObj = await Video.findOne({
            _id: new mongoose.Types.ObjectId(video_id),
            owner: new mongoose.Types.ObjectId(userId)
        }
        );
        if (!videoObj) throw new ApiError(404, "Video not found");

        if (title) videoObj.title = title;
        if (isPublish) videoObj.isPublish = isPublish;
        if (discription) videoObj.discription = discription;
        if (localThublinePath) {
            const newThumbnail = await UploadOnCloudinary(localThublinePath);
            if (!newThumbnail) throw new ApiError(501, "somthing went wrong while upoading Thumbnail");
            videoObj.thumbnail = newThumbnail.url;
        }

        await videoObj.save();

        const newVideoRes = await Video.findById(videoObj._id);

        if (!newVideoRes) throw ApiError(501, "Unable to update fileds");

        return res.status(201)
            .json(
                new Response(201, "Video Delete Successful", newVideoRes)
            );
    } catch (error) {
        console.log("Error :: Update Fields Video :: ", error);
    }
})


