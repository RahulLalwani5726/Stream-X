import { asyncHandler } from "../../utils/asyncHandler.js";
import {ApiError} from "../../utils/ApiError.js"
import {User} from "../../models/User.model.js"
import {UploadOnCloudinary} from "../../utils/cloudinary.js"
import {Response} from "../../utils/Response.js"

const AccessAndRefreshGenrator = async(userId) => {
    const user = await User.findById(userId);
    if(!user) throw new ApiError(500,"Somting went Wrong while Creating Tokens")
    const accessToken = await user.genrateAccessToken()
    const refreshToken = await user.genrateAccessToken()
    user.refreshtoken = refreshToken;
    await user.save({validateBeforeSave:false})
    return {accessToken , refreshToken};
}
const userRegister = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
// ---------------------------------------------
    // get user details from frontend
    const {fullname , password , email , username} = req.body;
    // validation - not empty
    if([fullname , password,email,username].some(field => field?.trim() == "")){
        throw ApiError(401 , "All fields Are Required");
    }
    // check if user already exists: username, email
    const checkUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(checkUser) throw new ApiError(401 , "User Already Exits");
    

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverimageLocalPath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
        coverimageLocalPath = req.files.coverimage[0].path;
    }

    if(!avatarLocalPath) throw new ApiError(401,"Avatar Img is Required");

    // upload them to cloudinary,check avatar
    const avatar = await UploadOnCloudinary(avatarLocalPath);
    const coverimage = await UploadOnCloudinary(coverimageLocalPath);

    if(!avatar) throw new ApiError(500 , "Somting Went Wrong While Uploading File");
    // create user object - create entry in db

    const userObj = {
        username:username.trim().toLowerCase(),
        email:email,
        fullname:fullname,
        password:password,
        avatar:avatar.url,
        coverimage:coverimage?.url || ""
    }
    const user = await User.create(userObj);
    // remove password and refresh token field from response
    const {accessToken , refreshToken} = await AccessAndRefreshGenrator(user._id);
    const options = {
        httpOnly: true,
        secure: true, 
    };
    const userData = await User.findById(user._id)?.select(
        "-password -refreshtoken"
    )
    // check for user creation
    if(!userData) throw new ApiError(500 , "Somting Went Wrong While Creating User")
    
    return res
    .status(201)
    .cookie("accessToken" , accessToken , options)
    .cookie("refreshToken" , refreshToken , options)
    .json(
        new Response(201 , "User Created Succeccfully! " , {userData , accessToken , refreshToken} , 201)
    )
    
})

export {
    userRegister,
}