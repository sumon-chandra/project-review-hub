import { Router } from "express";
import { mentorControllers } from "./mentor.controller.js";
import { mentorValidation } from "./mentor.validation.js";
import { auth } from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validate-request.js";

const mentorRoute = Router();

// Restrict all mentor routes exclusively to MENTOR role
mentorRoute.use(auth("MENTOR"));

mentorRoute.get(
	"/statistics",
	mentorControllers.getStatistics,
);

mentorRoute.get(
	"/submissions",
	validateRequest(mentorValidation.querySubmissionsSchema),
	mentorControllers.getSubmissions,
);

mentorRoute.get(
	"/submissions/:id",
	validateRequest(mentorValidation.getSubmissionByIdSchema),
	mentorControllers.getSubmissionById,
);

mentorRoute.patch(
	"/submissions/:id/review",
	validateRequest(mentorValidation.reviewSubmissionSchema),
	mentorControllers.reviewSubmission,
);

export default mentorRoute;
