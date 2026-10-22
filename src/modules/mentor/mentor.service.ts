import prisma from "../../lib/prisma.js";
import AppError from "../../utilities/app-error.js";
import type { QuerySubmissionsInput, ReviewSubmissionInput } from "./mentor.validation.js";
import { Prisma } from "../../../generated/prisma/client.js";

const getSubmissions = async (filters: QuerySubmissionsInput) => {
	const page = Number(filters.page) || 1;
	const limit = Number(filters.limit) || 10;
	const skip = (page - 1) * limit;

	const where: Prisma.ProjectSubmissionWhereInput = {};

	if (filters.status) {
		where.status = filters.status;
	}

	if (filters.search) {
		const search = filters.search.trim();
		where.OR = [
			{
				project: {
					projectName: { contains: search, mode: "insensitive" },
				},
			},
			{
				project: {
					student: {
						name: { contains: search, mode: "insensitive" },
					},
				},
			},
			{
				project: {
					student: {
						email: { contains: search, mode: "insensitive" },
					},
				},
			},
		];
	}

	const allowedSortFields = ["submittedAt", "attemptNumber", "status"] as const;
	const sortBy = allowedSortFields.includes(filters.sortBy as (typeof allowedSortFields)[number])
		? filters.sortBy
		: "submittedAt";
	const order = filters.order === "asc" ? "asc" : "desc";

	const orderBy = { [sortBy]: order };

	const [submissions, total] = await Promise.all([
		prisma.projectSubmission.findMany({
			where,
			skip,
			take: limit,
			orderBy,
			include: {
				project: {
					select: {
						id: true,
						projectName: true,
						repositoryUrl: true,
						liveUrl: true,
						student: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
				review: {
					select: {
						id: true,
						rating: true,
						decision: true,
						feedback: true,
						createdAt: true,
						mentor: {
							select: {
								id: true,
								name: true,
								email: true,
							},
						},
					},
				},
			},
		}),
		prisma.projectSubmission.count({ where }),
	]);

	const totalPage = Math.ceil(total / limit) || 1;

	return {
		submissions,
		meta: {
			page,
			limit,
			total,
			totalPage,
		},
	};
};

const getSubmissionById = async (submissionId: string) => {
	const submission = await prisma.projectSubmission.findUnique({
		where: { id: submissionId },
		include: {
			project: {
				include: {
					student: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
					submissions: {
						orderBy: { attemptNumber: "asc" },
						include: {
							review: {
								include: {
									mentor: {
										select: {
											id: true,
											name: true,
											email: true,
										},
									},
								},
							},
						},
					},
				},
			},
			review: {
				include: {
					mentor: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
			},
		},
	});

	if (!submission) {
		throw AppError.notFound("Submission attempt not found.");
	}

	return submission;
};

const reviewSubmission = async (
	submissionId: string,
	mentorId: string,
	input: ReviewSubmissionInput,
) => {
	return await prisma.$transaction(async (tx) => {
		// 1. Fetch submission within transaction and verify status
		const submission = await tx.projectSubmission.findUnique({
			where: { id: submissionId },
			include: { review: true },
		});

		if (!submission) {
			throw AppError.notFound("Submission attempt not found.");
		}

		if (submission.status !== "PENDING" || submission.review) {
			throw AppError.conflict(
				"This submission attempt has already been evaluated and finalized. Conflicting reviews are rejected.",
			);
		}

		// 2. Create the review record
		const review = await tx.projectReview.create({
			data: {
				submissionId: submission.id,
				mentorId,
				rating: input.rating,
				decision: input.decision,
				feedback: input.feedback?.trim() ?? null,
			},
			include: {
				mentor: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		// 3. Update the submission's status to the mentor's formal decision
		const updatedSubmission = await tx.projectSubmission.update({
			where: { id: submission.id },
			data: {
				status: input.decision,
			},
		});

		return {
			review,
			submission: updatedSubmission,
		};
	});
};

const getStatistics = async () => {
	const [totalSubmissions, totalProjects, pendingCount, approvedCount, rejectedCount] =
		await Promise.all([
			prisma.projectSubmission.count(),
			prisma.project.count(),
			prisma.projectSubmission.count({ where: { status: "PENDING" } }),
			prisma.projectSubmission.count({ where: { status: "APPROVED" } }),
			prisma.projectSubmission.count({ where: { status: "REJECTED" } }),
		]);

	return {
		totalSubmissions,
		totalProjects,
		pendingCount,
		approvedCount,
		rejectedCount,
	};
};

export const mentorServices = {
	getSubmissions,
	getSubmissionById,
	reviewSubmission,
	getStatistics,
};
