import { User } from "../../models/User.model.js";
import { Response } from "../../utils/Response.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const userLogout = asyncHandler( async (req , res) =>{
    // delete refresh token from DB
    await User.findByIdAndUpdate(req.user._id , {
        refreshtoken:undefined
    })

    // now delete Cookie from user
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new Response(200,{},"User Logouted")
    );
})

export {
    userLogout
}