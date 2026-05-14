import logger from "../utils/logger.js"
import ApiError from "../utils/ApiError.js";

const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    logger.error("Forbidden: User does not have admin privileges");
    throw new ApiError(403, "Forbidden: Admins only");
  }
};

export default checkAdmin;
