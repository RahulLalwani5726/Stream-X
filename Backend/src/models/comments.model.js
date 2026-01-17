import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
        default: null
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment", 
        default: null
    },
    tweet :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tweet",
        default:null
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export const Comment = mongoose.model("Comment", commentSchema);