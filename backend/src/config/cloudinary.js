import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import logger from "../utils/logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//cloudinary helper function to upload image
export const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      logger.error("File path is required for Cloudinary upload");
      throw new Error("File path is required for Cloudinary upload");
    }

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto", // Automatically detect the file type
    });

    //after uploading the file to cloudinary, delete the file from local storage
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error("Error deleting file from local storage: ", err);
      } else {
        logger.info("File deleted from local storage: ", filePath);
      }
    });

    return result;
  } catch (error) {
    logger.error("Error uploading to Cloudinary:", error);
    fs.unlinkSync(filePath);
    throw new Error("Cloudinary upload failed :", error);
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      logger.error("Public ID is required for Cloudinary deletion");
      throw new Error("Public ID is required for Cloudinary deletion");
    }
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error("Error deleting from Cloudinary:", error);
    throw new Error("Cloudinary deletion failed :", error);
  }
};
