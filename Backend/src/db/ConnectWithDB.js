import mongoose from "mongoose";
import { DBNAME } from "../constants.js";



const MakeConnection = async ()=>{
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DBNAME}`)
        // console.log("Connectiion is Stabilish ", connection.connection.host);
        
    } catch (error) {
        console.log("ConnectWithDB :: MakeConnection :: Failde ** ERROR ** :: ",error);
        process.exit(1); 
    }
}

export default MakeConnection;