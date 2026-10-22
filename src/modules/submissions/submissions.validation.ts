import { z } from "zod";

const createSubmissionSchema = z.object({
	body: z.object({
		projectName: z
			.string()
			.trim()
			.min(2, "Project name must be at least 2 characters")
			.max(100, "Project name cannot exceed 100 characters")
			.optional(),
		repositoryUrl: z
			.string()
			.trim()
			.url("Repository URL must be a valid URL")
			.optional(),
		liveUrl: z
			.string()
			.trim()
			.url("Live demo URL must be a valid URL")
			.optional(),
		description: z
			.string()
			.trim()
			.min(10, "Description must be at least 10 characters long")
			.max(3000, "Description cannot exceed 3000 characters"),
	}),
});

export const submissionsValidation = {
	createSubmissionSchema,
};

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>["body"];
