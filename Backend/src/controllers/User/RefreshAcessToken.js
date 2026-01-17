import { User } from "../../models/User.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { Response } from "../../utils/Response.js";

const AccessAndRefreshGenrator = async(userId) => {
    const user = await User.findById(userId);
    if(!user) throw new ApiError(500,"Somting went Wrong while Login User")
    const accessToken = await user.genrateAccessToken()
    const refreshToken = await user.genrateAccessToken()
    user.refreshtoken = refreshToken;
    await user.save({validateBeforeSave:false})
    return {accessToken , refreshToken};
}

export const refreshAccessToken = asyncHandler(async (req , res) =>{
    const token = req.cookies?.refreshtoken || req.body.refreshtoken;
        
    if(!token) throw new ApiError(405 , "Invalid Token");
    const DecodeJwT = jwt.verify(token,process.env.REFRESH_TOKEN_SECRET);
    
    const user = await User.findById(DecodeJwT?._id);

    if(!user) throw new ApiError(401,"Unauthroized Request");

    if(token !== user.refreshtoken) throw new ApiError(405 , "refreshtoken is closed or already use");

    const {accessToken, refreshtoken} = await AccessAndRefreshGenrator(user._id);
    const userData = await User.findById(user._id).select(
        "-password -refreshtoken"
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(201)
    .cookies("accessToken",accessToken,options)
    .cookies("refreshtoken",refreshtoken,options)
    .json(new Response(201,"Refresh Token Genrated" , {userData,accessToken,refreshtoken}));
})