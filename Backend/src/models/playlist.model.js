import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    discription: String,
    videos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video",
            required: true
        }
    ],
    isprivate:{
        type:Boolean,
        require:true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
},{timestamps:true})

export const Playlist = mongoose.model("Playlist",playlistSchema);