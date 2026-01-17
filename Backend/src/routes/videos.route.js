import { Router } from "express"
import { Upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    uploadViedo,
    deleteVideo,
    updateVideoFields,
    getVideo,
    getFeedVideo,
    getUserVideoList,
    getChannelVideos
} from "../controllers/Video.controllers.js";
import {
    createComment,
    deleteComment,
    editComment,
    commentList,
} from "../controllers/comments.controllers.js";
import {toggleLike} from "../controllers/Likes/Likes.js"
const videoRoute = Router();

videoRoute.route("/upload").post( verifyJWT , Upload.fields([
    {
        name: "video",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]), uploadViedo);

videoRoute.route("/").get(getFeedVideo)
videoRoute.route("/get-user-video-list").get(verifyJWT,getUserVideoList);
videoRoute.route("/get-channel-videos/:_id").get(getChannelVideos);
videoRoute.route("/delete/:video_id").delete(verifyJWT, deleteVideo)
videoRoute.route("/updatefields/:video_id").patch(verifyJWT,Upload.single("thumbnail"), updateVideoFields)
videoRoute.route("/watch/:video_id").get( verifyJWT , getVideo)

videoRoute.route("/comment/:id").get(verifyJWT,commentList)
videoRoute.route("/comment/create/:id").post(verifyJWT,createComment)
videoRoute.route("/comment/edit/:comment_id").patch(verifyJWT,editComment)
videoRoute.route("/comment/delete/:comment_id").delete(verifyJWT,deleteComment)
videoRoute.route("/Likes/:id").post(verifyJWT,toggleLike)
videoRoute.route("/comment/Likes/:id").post(verifyJWT,toggleLike)

export default videoRoute;
