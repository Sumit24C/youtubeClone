import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const authHeader = req.header("Authorization")
    const token = req.cookies?.accessToken ||
        (authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.replace("Bearer ", "") : null)

    console.log("getCurrentUser: ", token)
    if (!token) {
        throw new ApiError(401, "Unauthorized request")
    }

    let user;
    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(404, "User Not Found")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(403, 'Invalid or expired token')
    }
})