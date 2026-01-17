import mongoose from "mongoose"

const subscirptionSchema = new mongoose.Schema({
    subcriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})

export const Subscirption = mongoose.model("Subscirption",subscirptionSchema);
