import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { authServices } from "./auth.service.js";
import sendResponse from "../../utilities/send-response.js";

const signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

export const authControllers = {
	signup,
	login,
	getMe,
};
