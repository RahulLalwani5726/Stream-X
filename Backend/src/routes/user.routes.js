import { Router } from "express";
import { Upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    userRegister,
    userLogin,
    userLogout,
    refreshAccessToken,
    changePassword,
    updateField,
    updateAvatar,
    updateCoverImage,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    updateHistory,
    deleteAccount,

    getSubscriberList,
    getSubscriptionList,
    subscripion,
    getSubscribersCount
} from "../controllers/User.controllers.js";

const userRoute = Router();

// ... register/login routes ...

userRoute.route("/register").post(Upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 } // Fixed naming convention
]), userRegister);

userRoute.route("/login").post(userLogin);
userRoute.route("/logout").post(verifyJWT, userLogout);
userRoute.route("/refresh-token").post(refreshAccessToken);
userRoute.route("/change-password").post(verifyJWT, changePassword);
userRoute.route("/update-account").patch(verifyJWT, updateField); // Renamed to match frontend
userRoute.route("/current-user").get(verifyJWT, getCurrentUser);
userRoute.route("/delete").delete(verifyJWT , deleteAccount);
// --- FILE UPLOAD ROUTES ---
// 1. Avatar
userRoute.route("/avatar").patch(
    verifyJWT, 
    Upload.single("avatar"), 
    updateAvatar
);

// 2. Cover Image (Fixed URL and Multer Field)
userRoute.route("/cover-image").patch(
    verifyJWT, 
    Upload.single("coverImage"), // Must match frontend formData.append("coverImage")
    updateCoverImage
);

userRoute.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
userRoute.route("/history").get(verifyJWT, getWatchHistory); 
userRoute.route("/update-watch-history/:video_id").get(verifyJWT, updateHistory);

userRoute.route("/subscribers/count").get(verifyJWT, getSubscribersCount);
userRoute.route("/subscribe/:username").post(verifyJWT, subscripion);
userRoute.route("/subscribers/list").get(verifyJWT, getSubscriberList);
userRoute.route("/subscription/list").get(verifyJWT, getSubscriptionList);

export default userRoute;