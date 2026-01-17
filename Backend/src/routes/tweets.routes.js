import express from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {toggleLike} from "../controllers/Likes/Likes.js"
import {Upload} from "../middlewares/multer.middleware.js"
import {
    tweetList,
    createTweets,
    editTweet,
    viewTweet,
    deleteTweet,
    getUserTweetList,
    getChannelTweets,
} from "../controllers/tweets.js"
import {
    createComment,
    deleteComment,
    editComment,
    commentList,
} from "../controllers/comments.controllers.js";
const tweetRoute = express.Router();

tweetRoute.route("/").get(verifyJWT , tweetList);
tweetRoute.route("/get-user-tweet-list").get(verifyJWT,getUserTweetList);
tweetRoute.route("/get-channel-tweets/:_id").get(getChannelTweets);
tweetRoute.route("/create").post( verifyJWT,  Upload.single("image"),createTweets);
tweetRoute.route("/update/:tweetId").patch(Upload.none(),editTweet);
tweetRoute.route("/:tweetId").get(viewTweet);
tweetRoute.route("/delete/:tweetId").delete(deleteTweet);

tweetRoute.route("/Likes/:id").post(verifyJWT,toggleLike)

tweetRoute.route("/comment/:id").get(verifyJWT,commentList)
tweetRoute.route("/comment/create/:id").post(verifyJWT,createComment)
tweetRoute.route("/comment/edit/:comment_id").patch(verifyJWT,editComment)
tweetRoute.route("/comment/delete/:comment_id").delete(verifyJWT,deleteComment)
tweetRoute.route("/comment/Likes/:id").post(verifyJWT,toggleLike)
export {
    tweetRoute
}