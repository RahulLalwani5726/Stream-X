import {asyncHandler} from "../../utils/asyncHandler.js"
import {User} from "../../models/User.model.js"
import {ApiError} from "../../utils/ApiError.js"
import { Response } from "../../utils/Response.js";

export const updateField = asyncHandler(async(req , res) => {
    const {username , email, fullname} = req.body;
    if(!username && !email && !fullname) throw new ApiError(400 , "one field must Required");
   try {
     const user = await User.findById(user?._id);
     if(!user) throw new ApiError(404,"User Not Loged in");
     if(username){
         user.username = username;
     }
     if(email){
         user.email = email;
     }
     if(fullname){
         user.fullname = fullname;
     }
 
     await user.save({validateBeforeSave:false});
     const newUser = await  User.findById(user._id);
     return res.status(201)
     .json( new Response(201,"Fields Updated" , newUser));
   } catch (error) {
        console.log("Error :: Update Fields :: ",error.messege);
   }
})