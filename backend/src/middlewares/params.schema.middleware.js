import { z } from "zod";
import logger from "../utils/logger.js";
import ApiResponse from "../utils/ApiResponse.js";

export const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      logger.error("Error from param middleware :", error);
      return res
        .status(400)
        .json(ApiResponse.error(400, "Product id not found"));
    }
  };
};
