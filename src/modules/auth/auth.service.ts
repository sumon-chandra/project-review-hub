import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import envConfigs from "../../configs/env-configs.js";
import prisma from "../../lib/prisma.js";
import AppError from "../../utilities/app-error.js";
import type { SignupInput, LoginInput } from "./auth.validation.js";
import type { Role } from "../../../generated/prisma/enums.js";
import { generateToken, verifyToken } from "../../lib/jwt.js";

const registerStudent = async (input: SignupInput) => {
  const normalizedEmail = input.email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw AppError.conflict(
      "An account with this email address already exists.",
    );
  }

  const hashedPassword = await bcrypt.hash(
    input.password,
    envConfigs.bcrypt.saltRounds,
  );

  // Strictly enforce STUDENT role; public signup can never create a privileged role
  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "STUDENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateToken(
    payload,
    envConfigs.jwt.access_secret,
    envConfigs.jwt.access_expires_in,
  );
  const refreshToken = generateToken(
    payload,
    envConfigs.jwt.refresh_secret,
    envConfigs.jwt.refresh_expires_in,
  );

  return { user, accessToken, refreshToken };
};

const loginUser = async (input: LoginInput) => {
  const normalizedEmail = input.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw AppError.unauthorized("Invalid email or password.");
  }

  const isPasswordMatch = await bcrypt.compare(input.password, user.password);

  if (!isPasswordMatch) {
    throw AppError.unauthorized("Invalid email or password.");
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };
  const accessToken = generateToken(
    payload,
    envConfigs.jwt.access_secret,
    envConfigs.jwt.access_expires_in,
  );
  const refreshToken = generateToken(
    payload,
    envConfigs.jwt.refresh_secret,
    envConfigs.jwt.refresh_expires_in,
  );

  return { user: safeUser, accessToken, refreshToken };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      project: {
        select: {
          id: true,
          projectName: true,
          repositoryUrl: true,
          liveUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!user) {
    throw AppError.notFound("User not found.");
  }

  return user;
};

const refreshToken = async (token: string) => {
  let decoded: JwtPayload;

  try {
    decoded = verifyToken<JwtPayload>(token, envConfigs.jwt.refresh_secret);
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw AppError.unauthorized(
        "Refresh token has expired. Please log in again.",
      );
    }
    throw AppError.unauthorized("Invalid refresh token.");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    throw AppError.unauthorized("User does not exist.");
  }

  const jwtPayload: JwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role as Role,
  };

  const accessToken = generateToken(
    jwtPayload,
    envConfigs.jwt.access_secret,
    envConfigs.jwt.access_expires_in,
  );
  const refreshToken = generateToken(
    jwtPayload,
    envConfigs.jwt.refresh_secret,
    envConfigs.jwt.refresh_expires_in,
  );

  return { accessToken, refreshToken };
};

export const authServices = {
  registerStudent,
  loginUser,
  getMe,
  refreshToken,
};
