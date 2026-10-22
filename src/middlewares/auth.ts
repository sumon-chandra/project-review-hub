import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import envConfigs from "../configs/env-configs.js";
import prisma from "../lib/prisma.js";
import AppError from "../utilities/app-error.js";
import type { JwtPayload } from "../types/index.js";
import type { Role } from "../../generated/prisma/enums.js";

/**
 * Authentication and Role-Based Authorization Middleware
 *
 * Usage:
 * - router.get("/me", auth(), controller) // Any authenticated user
 * - router.get("/admin", auth("MENTOR"), controller) // Only MENTOR
 * - router.get("/shared", auth("STUDENT", "MENTOR"), controller) // Either role
 */
export const auth = (...requiredRoles: Role[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw AppError.unauthorized(
          "Authentication token is missing or malformed.",
        );
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        throw AppError.unauthorized("Authentication token is missing.");
      }

      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(token, envConfigs.jwt.access_secret) as JwtPayload;
      } catch (jwtError) {
        if (jwtError instanceof jwt.TokenExpiredError) {
          throw AppError.unauthorized(
            "Authentication token has expired. Please log in again.",
          );
        }
        throw AppError.unauthorized("Invalid authentication token.");
      }

      if (!decoded || !decoded.id) {
        throw AppError.unauthorized("Invalid token payload.");
      }

      // Verify user existence in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        throw AppError.unauthorized("User account no longer exists.");
      }

      // Role-based authorization
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw AppError.forbidden(
          "You do not have permission to access this resource.",
        );
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
