import { z } from "zod";

const submissionStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);
const reviewRatingEnum = z.enum([
	"EXCELLENT",
	"VERY_GOOD",
	"GOOD",
	"NEEDS_IMPROVEMENT",
	"UNSATISFACTORY",
]);

const querySubmissionsSchema = z.object({
	query: z.object({
		page: z.coerce.number().int().positive().default(1),
		limit: z.coerce.number().int().positive().max(50).default(10),
		status: submissionStatusEnum.optional(),
		sortBy: z.enum(["submittedAt", "attemptNumber", "status"]).default("submittedAt"),
		order: z.enum(["asc", "desc"]).default("desc"),
		search: z.string().trim().optional(),
	}),
});

const getSubmissionByIdSchema = z.object({
	params: z.object({
		id: z.string().uuid("Invalid submission ID format"),
	}),
});

const reviewSubmissionSchema = z.object({
	params: z.object({
		id: z.string().uuid("Invalid submission ID format"),
	}),
	body: z
		.object({
			rating: reviewRatingEnum,
			decision: z.enum(["APPROVED", "REJECTED"]),
			feedback: z
				.string()
				.trim()
				.min(5, "Feedback must be at least 5 characters long")
				.max(3000, "Feedback cannot exceed 3000 characters")
				.optional(),
		})
		.refine(
			(data) => {
				// Require feedback when rejecting a project attempt
				if (data.decision === "REJECTED" && (!data.feedback || data.feedback.trim().length === 0)) {
					return false;
				}
				return true;
			},
			{
				message: "Constructive feedback is required when rejecting a submission attempt.",
				path: ["feedback"],
			},
		),
});

export const mentorValidation = {
	querySubmissionsSchema,
	getSubmissionByIdSchema,
	reviewSubmissionSchema,
};

export type QuerySubmissionsInput = z.infer<typeof querySubmissionsSchema>["query"];
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>["body"];
