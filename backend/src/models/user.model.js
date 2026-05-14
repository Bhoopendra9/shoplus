import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    verifiedOtp: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
    },
    mobile: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_ACCESSTOKEN_SECRET,
    {
      expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRES_IN,
    },
  );
  return token;
};

userSchema.methods.generateRefreshToken = function () {
  const refreshToken = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_REFRESHTOKEN_SECRET,
    {
      expiresIn: process.env.JWT_REFRESHTOKEN_EXPIRES_IN,
    },
  );
  return refreshToken;
};

const User = mongoose.Model.user || mongoose.model("User", userSchema);

export default User;
