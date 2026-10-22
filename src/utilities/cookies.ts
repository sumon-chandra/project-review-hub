import type { Response } from "express";
import envConfigs from "../configs/env-configs";

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: envConfigs.nodeEnv === "production",
    sameSite: envConfigs.nodeEnv === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: envConfigs.nodeEnv === "production",
    sameSite: envConfigs.nodeEnv === "production" ? "none" : "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
  });
};
