import { Router } from "express";
import { submissionsControllers } from "./submissions.controller.js";
import { submissionsValidation } from "./submissions.validation.js";
import { auth } from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validate-request.js";
import { submissionLimiter } from "../../middlewares/rate-limiter.js";

const submissionsRoute = Router();

// All submission routes are restricted to authenticated students
submissionsRoute.use(auth("STUDENT"));

submissionsRoute.post(
	"/",
	submissionLimiter,
	validateRequest(submissionsValidation.createSubmissionSchema),
	submissionsControllers.submitProject,
);

submissionsRoute.get(
	"/me",
	submissionsControllers.getMySubmissions,
);

export default submissionsRoute;
