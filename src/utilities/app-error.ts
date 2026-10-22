import status from "http-status";

export type ErrorCode =
	| "BAD_REQUEST"
	| "VALIDATION_ERROR"
	| "NOT_FOUND"
	| "UNAUTHORIZED"
	| "FORBIDDEN"
	| "EMAIL_CONFLICT"
	| "AUTH_FAILED"
	| "INTERNAL_ERROR";

export interface AppErrorOptions {
	statusCode: number;
	message: string;
	code?: ErrorCode;
	isOperational?: boolean;
	stack?: string;
	meta?: Record<string, unknown>;
}

class AppError extends Error {
	public readonly statusCode: number;
	public readonly code: ErrorCode;
	public readonly isOperational: boolean;
	public readonly meta?: Record<string, unknown>;

	constructor({ statusCode, message, code = "INTERNAL_ERROR", isOperational = true, stack = "", meta }: AppErrorOptions) {
		super(message);

		this.name = "AppError";
		this.statusCode = statusCode;
		this.code = code;
		this.isOperational = isOperational;
		this.meta = meta;

		if (stack) {
			this.stack = stack;
		} else {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	static notFound(message = "Resource not found.") {
		return new AppError({ statusCode: status.NOT_FOUND, message, code: "NOT_FOUND" });
	}

	static badRequest(message = "Bad request.") {
		return new AppError({ statusCode: status.BAD_REQUEST, message, code: "NOT_FOUND" });
	}

	static unauthorized(message = "Unauthorize access.") {
		return new AppError({ statusCode: status.UNAUTHORIZED, message, code: "UNAUTHORIZED" });
	}

	static forbidden(message = "Forbidden.") {
		return new AppError({ statusCode: status.FORBIDDEN, message, code: "FORBIDDEN" });
	}

	static conflict(message: string, code: "EMAIL_CONFLICT") {
		return new AppError({ statusCode: status.CONFLICT, message, code });
	}

	static internal(message = "Something went wrong.", meta?: Record<string, unknown>) {
		return new AppError({
			statusCode: status.INTERNAL_SERVER_ERROR,
			message,
			code: "INTERNAL_ERROR",
			isOperational: false,
			meta,
		});
	}
}

export default AppError;
