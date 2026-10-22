import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { mentorServices } from "./mentor.service.js";
import sendResponse from "../../utilities/send-response.js";
import type { QuerySubmissionsInput } from "./mentor.validation.js";

const getSubmissions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await mentorServices.getSubmissions(req.query as unknown as QuerySubmissionsInput);

		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Submissions retrieved successfully.",
			data: result.submissions,
			meta: result.meta,
		});
	} catch (error) {
		next(error);
	}
};

const getSubmissionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const submissionId = req.params.id as string;
		const result = await mentorServices.getSubmissionById(submissionId);

		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Submission details retrieved successfully.",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

const reviewSubmission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const submissionId = req.params.id as string;
		const mentorId = req.user!.id;
		const result = await mentorServices.reviewSubmission(submissionId, mentorId, req.body);

		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Submission evaluated and review recorded successfully.",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

const getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const result = await mentorServices.getStatistics();

		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Global statistics retrieved successfully.",
			data: result,
		});
	} catch (error) {
		next(error);
	}
};

export const mentorControllers = {
	getSubmissions,
	getSubmissionById,
	reviewSubmission,
	getStatistics,
};
