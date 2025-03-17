// Yeh middleware main isliye likh rha hoon kyonki mujhe logout krwana tha toh mujhe valid user nikalna tha toh maine middlware banadiya toh isse mera user validate hojaayega chahta toh main itna code na likhne ke bajaye main controllers mein hi likh leta pr mujhse yeh code reuse nhi hopata toh maine usko yahi likh diya h toh ab yeh reuseable code h

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async(req,res) => {
    try {
        const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","")
        // token milgaya
        // console.log("This is the token",token)
        if(!token) {
            throw new ApiError(401,"Unauthorized request")
        }
    
        //decode krna h token ko
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
        
        if(!user) {
            throw new ApiError(401,"Invalid Access Token")
        }
    
        req.user = user; 
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})