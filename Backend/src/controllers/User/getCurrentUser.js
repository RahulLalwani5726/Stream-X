import {asyncHandler} from "../../utils/asyncHandler.js"
import { Response } from "../../utils/Response.js";
export const getCurrentUser = asyncHandler((req , res) => {
    return res
    .status(201)
    .json(
        new Response(201,"Current User fetch successfully ", req.user)
    )
})