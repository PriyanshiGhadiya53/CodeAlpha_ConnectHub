import jwt from "jsonwebtoken";
import { apiError } from "../util/apiError.js";
import { User } from "../model/user.model.js";


const verifyJWT = async (req, res, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new apiError(401, "Access token not found");
        }
    
        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id || decodedToken?.id).select("-password -refreshToken");
    
        if (!user) {
            throw new apiError(401, "Invalid access token");
        }
        req.user = user;
        next();
    
    }  catch (error) {
        next(
            error instanceof apiError
                ? error
                : new apiError(401, "Invalid access token")
        );
    }
}


export default verifyJWT