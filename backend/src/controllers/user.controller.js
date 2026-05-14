import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";
import sendMail from "../utils/email.js";

import {
  userRegisterSchema,
  verifyEmailOptSchema,
  userLoginSchema,
} from "../utils/validation.user.js";

//Register user
export const registerUser = asyncHandler(async (req, res) => {
  logger.info("Registering new user with email: ", req.body.email);
  const result = userRegisterSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.flatten().fieldErrors;
    logger.error("Validation Error: ", formattedErrors);
    throw new ApiError(400, "Validation Error", formattedErrors);
  }

  const { firstName, lastName, email, password, mobile, role } = result.data;

  let user = await User.findOne({ email });

  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

  if (user) {
    if (user.verifiedOtp) {
      logger.error("Email already in use: ", email);
      throw new ApiError(
        400,
        "Email already registered. Please login instead.",
      );
    } else {
      logger.error("Email already registered but not verified: ", email);
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    }
  } else {
    user = await User.create({
      firstName,
      lastName,
      email,
      password,
      otp,
      otpExpires,
      mobile,
      role,
    });
    if (!user) {
      logger.error("Failed to create user with email: ", email);
      throw new ApiError(500, "Failed to create user");
    }
  }

  // Send OTP email
  logger.info("Sending OTP email to: ", email);
  await sendMail({
    to: user.email,
    subject: "Welcome to Shoplus! Please verify your email",
    html: `<p>Hi ${firstName},</p>
    <p>Thank you for registering at Shoplus! Please use the following OTP to verify your email address:</p>
    <h2>${otp}</h2>
    <p>This OTP is valid for 10 minutes.</p>
    <p>Best regards,<br/>Shoplus Team</p>
    `,
  });

  logger.info("User registered successfully with email: ", email);
  return res.json(
    ApiResponse.success(201, "User registered successfully", user),
  );
});

//verify email otp
export const verifyEmailOtp = asyncHandler(async (req, res) => {
  logger.info("Verifying email OTP for user");

  const result = verifyEmailOptSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.flatten().fieldErrors;
    logger.error("Validation Error: ", formattedErrors);
    throw new ApiError(400, "Validation Error", formattedErrors);
  }

  const { otp } = result.data;

  const user = await User.findOne({
    otp,
    otpExpires: { $gt: Date.now() }, // Check if OTP is still valid
  });
  if (!user) {
    logger.error("Invalid or expired OTP: ", otp);
    throw new ApiError(400, "Invalid or expired OTP");
  }

  user.verifiedOtp = true;
  user.otp = undefined; // Clear OTP after successful verification
  user.otpExpires = undefined; // Clear OTP expiration
  await user.save();

  logger.info("Email verified successfully for user: ", user.email);
  return res.json(ApiResponse.success(200, "Email verified successfully"));
});

//Login user
export const loginUser = asyncHandler(async (req, res) => {
  logger.info("Logging in user with email: ", req.body.email);

  const result = userLoginSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.flatten().fieldErrors;
    logger.error("Validation Error: ", formattedErrors);
    throw new ApiError(400, "Validation Error", formattedErrors);
  }

  const { email, password } = result.data;

  const user = await User.findOne({ email });
  if (!user) {
    logger.error("User not found with email: ", email);
    throw new ApiError(400, "Invalid email or password");
  }

  if (!user.verifiedOtp) {
    logger.error("Email not verified for user: ", email);
    throw new ApiError(
      400,
      "Email not verified. Please verify your email before logging in.",
    );
  }

  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    logger.error("Invalid password for user: ", email);
    throw new ApiError(400, "Invalid email or password");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  const userData = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  // Set refresh token in HTTP-only cookie
  const options = {
    httpOnly: true, // ❗ prevents JS access
    secure: process.env.NODE_ENV === "production", // ❗ only HTTPS (set false in dev)
    sameSite: "strict", // CSRF protection
  };

  logger.info("User logged in successfully: ", email);
  res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      ApiResponse.success(200, "User logged in successfully", userData, {
        accessToken,
        refreshToken,
      }),
    );
});

export const logoutUser = asyncHandler(async (req, res) => {
  // clear cookies
  logger.info("Logging out user...");
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        //this will remove the field from db
        refreshToken: 1,
      },
    },
    { new: true, validateBeforeSave: false },
  );

  const options = {
    httpOnly: true, // ❗ prevents JS access
    secure: process.env.NODE_ENV === "production", // ❗ only HTTPS (set false in dev)
    sameSite: "strict", // CSRF protection
  };

  logger.info("User logged out successfully: ", req.user.email);
  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(ApiResponse.success(200, "User logged out successfully"));
});

export const userProfile = asyncHandler(async (req, res) => {
  logger.info("Fetching user profile for user: ", req.user.email);
  const user = await User.findById(req.user._id).select(
    "-password -refreshToken",
  );
  if (!user) {
    logger.error("User not found with ID: ", req.user._id);
    throw new ApiError(404, "User not found");
  }
  logger.info("User profile fetched successfully for user: ", req.user.email);
  return res.json(ApiResponse.success(200, "User profile fetched successfully", user));
});

//refresh token
const refreshToken = asyncHandler(async (req, res) => {
  logger.info("Refreshing access token for user: ", req.user.email);
  

});
