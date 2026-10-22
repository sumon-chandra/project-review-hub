import type { Request, Response } from "express";
import status from "http-status";

export const notFoundHandler = (req: Request, res: Response): void => {
	res.status(status.NOT_FOUND).json({
		success: false,
		statusCode: status.NOT_FOUND,
		message: `API route not found: ${req.method} ${req.originalUrl}`,
	});
};

export default notFoundHandler;
