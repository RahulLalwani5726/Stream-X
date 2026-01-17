import mongoose from "mongoose"
import jwt from "jsonwebtoken" // ye crypto graphi algo ka use kar ta hai aur iska use hum refresh token ke liye kare ge
import bcrypt from "bcrypt" // ye be same crypto graphi algo ka use kr ta hai per iska use hum password ko incrypt / dcrypt ke liye kare ge

const userSchema = new mongoose.Schema({
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true // Helpful for optimizing search queries
    },
    email: {
        type: String,
        required: true,
        unique: true, // Recommended to prevent duplicate emails
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: true
    },
    coverimage: {
        type: String,
        default: "" // Optional, good to have a default
    },
    refreshtoken: {
        type: String,
        default: ""
    }
}, { timestamps: true });

// ye ek hook hai jo mongosse deta hai aur be bahut hai pre , post etc
// pre hook se hum data me kuch be badlaw jaise , save , delete , update , validate etc
// hone se just phele ye active ho gai ga aur hume isko 2nd argument me midlewere denge 
// hume bs midleware aur kab midle ware active karna hai vo dena hai

// midleware 4 chize leta hai error , req , res , next 
// hum abhi bs next flag lenge aur kaam kar ne ke baad usse agle wale ko de denge
userSchema.pre("save" , async function(next){
    // hum isme arrow function ka use isliye nahi kar rhe hai kyo ke arrow function me this context nahi hota
    if(!this.isModified("password")) return next(); // this.isModified() is buildin method hai jis se hum kaise spacific entry be changes huye hai ya nahi vo pta kr sakte hai

    this.password = await bcrypt.hash(this.password , 10);
})



// ab mongoose me hum midlewre ke sath methods be add kar sakte hai
userSchema.methods.isPasswordCurrect = async function(password){
    // bcrypt.compare() -> ye true ya false return kare ye first password string me lega  aur 2nd argument me encrypt password lega
    return await bcrypt.compare(password , this.password);
}

// hum isme access token genrate karne ka method be likhe ge
// userSchema.methods -> ye ek object hai aur hum isme dot(.) se methods aur value add karte hai
userSchema.methods.genrateAccessToken = function(){
    // jwt.sign( // -> iska use toekn bna ne ke liye kiye jaata hai
    //     // ye 3 chize lega 
    //     {},// 1. payload ke ye token kya contain kare ga 
    //     key,// 2. access token key
    //     {},// 3. toekn exp
    // ) 
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXP 
        }
    )
}
userSchema.methods.genrateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id // refresh toekn baar baar refresh hota hai isliye hum isme value kam he rakh te hai
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXP
        }
    )
}
export const User = mongoose.model("User" , userSchema);