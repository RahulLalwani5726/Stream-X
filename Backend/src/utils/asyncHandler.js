// ab hum DB se baar baar communicate kar te hai user ke liye user ke data etc ke liye 
// to jab jab hume DB se communcate karna hota hai to hum try-catch aur async ka use karta hai
// to iske liye hum ek gernal function bna dete hai
// jisme hum DB communicate ka function denge aur ye function us function ko try catch lga kr call kar ke disere output dega


// isse hum 2 terha se bna sakte hai
// 1. promise 2. try-catch

// 1 -> 

export const asyncHandler = (RequestHandler) => (
    (req , res , next) =>(
        Promise.resolve(RequestHandler(req , res , next))
        .catch((error) => next(error))
    )
)

// 2 ->
// const asyncHandler =  (fn) => // humne function ke ander ek aur function bna ya aur return kiya hai jo parameter wale function ko call kar ta hai 
//      async (req , res , next) =>{
//         try {
//             await fn(req , res , next);
//         } catch (error) {
//             res.status(error.code || 8000).json({
//                 success:false,
//                 messege:error.messege
//             })
//         }
//     }   