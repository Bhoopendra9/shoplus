import express from "express";
import {
  registerUser,
  verifyEmailOtp,
  loginUser,
  userProfile,
  logoutUser,
} from "../controllers/user.controller.js";
import authUserMiddleware from "../middlewares/auth.user.middleware.js";
import checkAdmin from "../middlewares/admin.middleware.js";

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/verify-email").post(verifyEmailOtp);
router.route("/login").post(loginUser);
router.route("/logout").get(authUserMiddleware, logoutUser);
router.route("/profile").get(authUserMiddleware, userProfile);

export default router;
