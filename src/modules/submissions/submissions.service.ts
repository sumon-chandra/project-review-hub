import prisma from "../../lib/prisma.js";
import AppError from "../../utilities/app-error.js";
import { normalizeUrl } from "../../utilities/normalize-url.js";
import type { CreateSubmissionInput } from "./submissions.validation.js";

const submitProjectOrAttempt = async (studentId: string, input: CreateSubmissionInput) => {
	// 1. Check if student already owns a project
	const existingProject = await prisma.project.findUnique({
		where: { studentId },
		include: {
			submissions: {
				orderBy: { attemptNumber: "desc" },
				take: 1,
			},
		},
	});

	// CASE A: Initial Project Submission
	if (!existingProject) {
		if (!input.projectName || !input.repositoryUrl || !input.liveUrl) {
			throw AppError.badRequest(
				"Project name, repository URL, and live demo URL are required for the initial project submission.",
			);
		}

		const normalizedRepoUrl = normalizeUrl(input.repositoryUrl, "Repository URL");
		const normalizedLiveUrl = normalizeUrl(input.liveUrl, "Live demo URL");

		// Check for duplicate URLs across all existing projects
		const existingRepo = await prisma.project.findUnique({
			where: { repositoryUrl: normalizedRepoUrl },
		});
		if (existingRepo) {
			throw AppError.conflict("A project with this repository URL already exists.");
		}

		const existingLive = await prisma.project.findUnique({
			where: { liveUrl: normalizedLiveUrl },
		});
		if (existingLive) {
			throw AppError.conflict("A project with this live demo URL already exists.");
		}

		// Create project and first submission attempt atomically
		return await prisma.$transaction(async (tx) => {
			const project = await tx.project.create({
				data: {
					studentId,
					projectName: input.projectName!.trim(),
					repositoryUrl: normalizedRepoUrl,
					liveUrl: normalizedLiveUrl,
				},
			});

			const submission = await tx.projectSubmission.create({
				data: {
					projectId: project.id,
					attemptNumber: 1,
					description: input.description.trim(),
					repositoryUrl: normalizedRepoUrl,
					liveUrl: normalizedLiveUrl,
					status: "PENDING",
				},
			});

			return {
				project,
				submission,
				attemptNumber: 1,
				isResubmission: false,
			};
		});
	}

	// CASE B: Resubmission Attempt for Existing Project
	const latestAttempt = existingProject.submissions[0];

	if (latestAttempt) {
		if (latestAttempt.status === "PENDING") {
			throw AppError.conflict(
				"Your latest submission attempt is still pending review. You cannot resubmit until a mentor has completed the review.",
			);
		}
		if (latestAttempt.status === "APPROVED") {
			throw AppError.conflict(
				"This project has already been approved and cannot be resubmitted.",
			);
		}
		if (latestAttempt.status !== "REJECTED") {
			throw AppError.conflict(
				"Resubmission is only allowed after a previous attempt has been reviewed.",
			);
		}
	}

	// Resolve URLs and project name (falling back to existing if not provided in payload)
	const targetRepoUrl = input.repositoryUrl
		? normalizeUrl(input.repositoryUrl, "Repository URL")
		: existingProject.repositoryUrl;

	const targetLiveUrl = input.liveUrl
		? normalizeUrl(input.liveUrl, "Live demo URL")
		: existingProject.liveUrl;

	const targetProjectName = input.projectName
		? input.projectName.trim()
		: existingProject.projectName;

	// If URLs were changed, ensure they do not conflict with another project
	if (targetRepoUrl !== existingProject.repositoryUrl) {
		const repoConflict = await prisma.project.findFirst({
			where: {
				repositoryUrl: targetRepoUrl,
				NOT: { id: existingProject.id },
			},
		});
		if (repoConflict) {
			throw AppError.conflict("Another project is already using this repository URL.");
		}
	}

	if (targetLiveUrl !== existingProject.liveUrl) {
		const liveConflict = await prisma.project.findFirst({
			where: {
				liveUrl: targetLiveUrl,
				NOT: { id: existingProject.id },
			},
		});
		if (liveConflict) {
			throw AppError.conflict("Another project is already using this live demo URL.");
		}
	}

	const nextAttemptNumber = (latestAttempt?.attemptNumber ?? 0) + 1;

	// Execute resubmission in an atomic transaction
	return await prisma.$transaction(async (tx) => {
		const updatedProject = await tx.project.update({
			where: { id: existingProject.id },
			data: {
				projectName: targetProjectName,
				repositoryUrl: targetRepoUrl,
				liveUrl: targetLiveUrl,
			},
		});

		const newSubmission = await tx.projectSubmission.create({
			data: {
				projectId: existingProject.id,
				attemptNumber: nextAttemptNumber,
				description: input.description.trim(),
				repositoryUrl: targetRepoUrl,
				liveUrl: targetLiveUrl,
				status: "PENDING",
			},
		});

		return {
			project: updatedProject,
			submission: newSubmission,
			attemptNumber: nextAttemptNumber,
			isResubmission: true,
		};
	});
};

const getMySubmissions = async (studentId: string) => {
	const project = await prisma.project.findUnique({
		where: { studentId },
		include: {
			submissions: {
				orderBy: { attemptNumber: "desc" },
				include: {
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
			},
		},
	});

	return project;
};

export const submissionsServices = {
	submitProjectOrAttempt,
	getMySubmissions,
};
