// import mongoose from "mongoose";
// import {DBNAME} from "./constants";
// import express from "express" 
// // hum DB 2 terhe se connect kr sakte hai 
// // 1. main index me ifie ()() ka use kr ke  usme DB connect kr lo 
// // 2. sepreate file bna kr use import kr ke connect kr lo

// // method 1
// // isme ; is liye aaya kyu ke agar phele wale code me agar ; ye nahi to ifie be us code ka pert maan leta hai aur ifie ko run nahi kr ta jai
// //iske ander hum express ko be sath sath initslize kr dete hai ke express communicate kr pa rha ya nahi DB se
// const App = express();
// ;(async()=>{
//     try {
//        await mongoose.connect(`${process.env.MONGODB_URI}/${DBNAME}`)
//        App.on("error" , (error) => { // ye event listen kare ga jab error aaye ga 
//             console.log("Error unable to communiate with DB ",error);
//        })

//        App.listen(process.env.PORT , ()=>{
//         console.log("Server is lsting"); 
//        })
//     } catch (error) {
//         console.log("Error" , error);
//         throw error;
//     }
// })()