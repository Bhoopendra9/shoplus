import jwt from "jsonwebtoken";

import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";
import ApiError from "../utils/ApiError.js";

const authUserMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req.cookies?.accessToken || req.headers?.Authorization?.split(" ")[1];
    if (!accessToken) {
      logger.error("Unauthorized: No token provided");
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESSTOKEN_SECRET);
    if (!decoded) {
      logger.error("Unauthorized: Invalid token");
      throw new ApiError(401, "Unauthorized: Invalid token");
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error("Unauthorized: ", error.message);
    throw new ApiError(401, "Unauthorized: " + error.message);
  }
});

export default authUserMiddleware;
