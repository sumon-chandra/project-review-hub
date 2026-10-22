import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../utilities/app-error.js";

const globalErrorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
	let statusCode: number = status.INTERNAL_SERVER_ERROR;
	let message = "Internal Server Error";
	let errors: unknown = null;

	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
		errors = err.meta ?? err.code;
	} else if (err instanceof Error) {
		message = err.message || message;
		errors = err.stack ?? null;
	} else if (typeof err === "string") {
		message = err;
	}

	res.status(statusCode).json({
		success: false,
		message,
		errors,
	});
};

export default globalErrorHandler;
