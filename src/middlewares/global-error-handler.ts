import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { ZodError } from "zod";
import AppError from "../utilities/app-error.js";
import envConfigs from "../configs/env-configs.js";
import { Prisma } from "../../generated/prisma/client.js";

const globalErrorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction): void => {
	let statusCode: number = status.INTERNAL_SERVER_ERROR;
	let message = "Internal Server Error";
	let errors: unknown = null;

	// 1. Operational AppError
	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
		errors = err.meta ?? err.code;
	}
	// 2. Zod Validation Error
	else if (err instanceof ZodError) {
		statusCode = status.BAD_REQUEST;
		message = "Validation failed.";
		errors = err.issues.map((issue) => ({
			path: issue.path.filter((p) => p !== "body" && p !== "query" && p !== "params").join(".") || issue.path.join("."),
			message: issue.message,
		}));
	}
	// 3. Prisma Known Request Error
	else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			statusCode = status.CONFLICT;
			const target = (err.meta?.target as string[]) || [];
			const fieldName = target.length > 0 ? target.join(", ") : "field";
			message = `A record with this ${fieldName} already exists.`;
			errors = { target: err.meta?.target };
		} else if (err.code === "P2025") {
			statusCode = status.NOT_FOUND;
			message = "Requested record was not found.";
		} else if (err.code === "P2003") {
			statusCode = status.BAD_REQUEST;
			message = "Foreign key constraint failed on referenced resource.";
		} else {
			statusCode = status.BAD_REQUEST;
			message = `Database operation failed (${err.code}).`;
		}
	}
	// 4. Prisma Validation Error
	else if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = status.BAD_REQUEST;
		message = "Invalid database query parameters.";
	}
	// 5. Generic Error
	else if (err instanceof Error) {
		message = err.message || message;
		errors = envConfigs.nodeEnv === "development" ? err.stack : null;
	} else if (typeof err === "string") {
		message = err;
	}

	res.status(statusCode).json({
		success: false,
		statusCode,
		message,
		errors: errors ?? undefined,
		stack: envConfigs.nodeEnv === "development" && err instanceof Error ? err.stack : undefined,
	});
};

export default globalErrorHandler;
