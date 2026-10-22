import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { authServices } from "./auth.service.js";
import sendResponse from "../../utilities/send-response.js";
import AppError from "../../utilities/app-error.js";
import envConfigs from "../../configs/env-configs.js";

const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authServices.registerStudent(req.body);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Student account registered successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authServices.loginUser(req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Logged in successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await authServices.getMe(req.user!.id);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User profile retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw AppError.unauthorized("Refresh token is required.");
    }

    const result = await authServices.refreshToken(refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: envConfigs.nodeEnv === "production",
      sameSite: envConfigs.nodeEnv === "production" ? "none" : "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: envConfigs.nodeEnv === "production",
      sameSite: envConfigs.nodeEnv === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Access token refreshed successfully.",
      data: { accessToken: result.accessToken },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: envConfigs.nodeEnv === "production",
      sameSite: envConfigs.nodeEnv === "production" ? "none" : "lax",
    });
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: envConfigs.nodeEnv === "production",
      sameSite: envConfigs.nodeEnv === "production" ? "none" : "lax",
    });

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Logged out successfully.",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const authControllers = {
  signup,
  login,
  getMe,
  refreshToken,
  logout,
};
