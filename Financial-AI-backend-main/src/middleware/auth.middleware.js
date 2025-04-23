import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const verifyJWT = async(req, res, next) => {
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
           const user = null;
           req.user = user;
           return next();
        }
        else{
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)        
    
        const user = await User.findById(decodedToken?.id).select("-password -refreshToken")
        console.log(user)
        if (!user) {     
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next();
        }
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
};