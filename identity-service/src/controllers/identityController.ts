import { Request, Response } from "express";
import asyncHandler from "../middleware/asyncHandler";
import logger from "../utils/logger";
import userModel from "../models/userModel";
import refreshTokenModel from "../models/refreshTokenModel";
import { validateLogin, validateRegistration } from "../utils/validation";
import { generateTokens } from "../utils/jwtHelper";
import {
  LoginUserInput,
  RefreshTokenI,
  RegisterUserInput,
} from "../types/identityControllerTypes";

// user registration

const registerUser = asyncHandler(
  async (req: Request<{}, {}, RegisterUserInput>, res: Response) => {
    logger.info("registerUser called");
    if (!req.body || Object.keys(req.body).length === 0) {
      logger.warn("Request body is empty or undefined");
      return res
        .status(400)
        .json({ success: false, message: "Request body is required" });
    }
    const { error } = validateRegistration(req.body);

    if (error) {
      const messages = error.details.map((err) => err.message);
      logger.warn("Validation Error", { messages });
      return res.status(400).json({ success: false, message: messages });
    }

    const { email, userName } = req.body;
    // Check if email or userName already exists

    let existingUser = await userModel.findOne({
      $or: [{ email }, { userName }],
    });

    if (existingUser) {
      const errorMessageUserAlreadyExists = "User already exists";
      logger.warn("User already exists", {
        message: errorMessageUserAlreadyExists,
      });
      return res
        .status(400)
        .json({ success: false, message: errorMessageUserAlreadyExists });
    } else {
      // create new user
      const user = new userModel(req.body);
      await user.save();
      logger.info("User created successfully", { email });

      // generate access token
      const { accessToken, refreshToken } = await generateTokens(user);

      logger.info("Refresh token created successfully for the user");
      logger.info({
        message: "Request body",
        body: accessToken,
      });
      return res.status(201).json({
        success: true,
        message: "User created",
        accessToken,
        refreshToken,
      });
    }
  }
);

// user login
const loginUser = asyncHandler(
  async (req: Request<{}, {}, LoginUserInput>, res: Response) => {
    logger.info("LoginUser endpoint hit");
    // validate req body
    const { error } = validateLogin(req.body);
    if (error) {
      const messages = error.details.map((err) => err.message);
      logger.warn("Validation Error", { messages });
      return res.status(400).json({ success: false, message: messages });
    }

    // validate user email in the db
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      logger.warn("Invalid user");
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // validate user password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      logger.warn("Invalid password");
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.json({
      accessToken,
      refreshToken,
      userId: user._id,
    });
  }
);

// refresh token

const refreshToken = asyncHandler(
  async (req: Request<{}, {}, RefreshTokenI>, res: Response) => {
    logger.info("RefreshToken endpoint hit");
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("RefreshToken missing");
      return res
        .status(400)
        .json({ success: false, message: "Refresh token missing" });
    }
    const storedToken = await refreshTokenModel.findOne({
      token: refreshToken,
    });
    if (!storedToken || storedToken?.expiresAt < new Date()) {
      logger.warn("Invalid or expired refresh token");
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await userModel.findById(storedToken.user);
    if (!user) {
      logger.warn("User not found");
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await generateTokens(user);
    // delete the old refresh token
    await refreshTokenModel.deleteOne({ _id: storedToken._id });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }
);

// logout

const logoutUser = asyncHandler(
  async (req: Request<{}, {}, RefreshTokenI>, res: Response) => {
    logger.info("logout user endpoint hit");
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("RefreshToken missing");
      return res
        .status(400)
        .json({ success: false, message: "Refresh token missing" });
    }
    const result = await refreshTokenModel.deleteOne({ token: refreshToken });

    if (result.deletedCount === 0) {
      logger.warn("No matching token found to delete");
      res.status(200).json({ success: false, message: "Invalid token" });
    } else {
      logger.info("Refresh token delete on logout");
      res
        .status(200)
        .json({ success: true, message: "Logged out successfully!" });
    }
  } 
);

export { registerUser, loginUser, refreshToken, logoutUser };
