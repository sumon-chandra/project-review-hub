import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import envConfigs from "../../configs/env-configs.js";
import prisma from "../../lib/prisma.js";
import AppError from "../../utilities/app-error.js";
import type { SignupInput, LoginInput } from "./auth.validation.js";
import type { Role } from "../../../generated/prisma/enums.js";

const generateToken = (payload: { id: string; email: string; role: Role }): string => {
	return jwt.sign(payload, envConfigs.jwt.secret, {
		expiresIn: envConfigs.jwt.expiresIn as jwt.SignOptions["expiresIn"],
	});
};

const registerStudent = async (input: SignupInput) => {
	const normalizedEmail = input.email.toLowerCase().trim();

	const existingUser = await prisma.user.findUnique({
		where: { email: normalizedEmail },
	});

	if (existingUser) {
		throw AppError.conflict("An account with this email address already exists.");
	}

	const hashedPassword = await bcrypt.hash(input.password, envConfigs.bcrypt.saltRounds);

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

	const token = generateToken({
		id: user.id,
		email: user.email,
		role: user.role,
	});

	return { user, token };
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

	const token = generateToken({
		id: user.id,
		email: user.email,
		role: user.role,
	});

	return { user: safeUser, token };
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

export const authServices = {
	registerStudent,
	loginUser,
	getMe,
};
