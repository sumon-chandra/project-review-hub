import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { submissionsServices } from "./submissions.service.js";
import sendResponse from "../../utilities/send-response.js";

const submitProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const studentId = req.user!.id;
		const result = await submissionsServices.submitProjectOrAttempt(studentId, req.body);

		sendResponse(res, {
			statusCode: result.isResubmission ? status.OK : status.CREATED,
			success: true,
			message: result.isResubmission
				? `Submission attempt #${result.attemptNumber} submitted successfully.`
				: "Project created and initial submission attempt submitted successfully.",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

const getMySubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const studentId = req.user!.id;
		const result = await submissionsServices.getMySubmissions(studentId);

		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: result ? "Project and submission history retrieved successfully." : "No project found.",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

export const submissionsControllers = {
	submitProject,
	getMySubmissions,
};
