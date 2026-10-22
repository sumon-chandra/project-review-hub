import rateLimit from "express-rate-limit";
import status from "http-status";

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 20, // Limit each IP to 20 requests per windowMs
	standardHeaders: "draft-7",
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(status.TOO_MANY_REQUESTS).json({
			success: false,
			statusCode: status.TOO_MANY_REQUESTS,
			message: "Too many login/signup attempts. Please try again after 15 minutes.",
			data: null,
		});
	},
});

export const submissionLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 30, // Limit each IP to 30 submissions per windowMs
	standardHeaders: "draft-7",
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(status.TOO_MANY_REQUESTS).json({
			success: false,
			statusCode: status.TOO_MANY_REQUESTS,
			message: "Submission rate limit exceeded. Please try again after 15 minutes.",
			data: null,
		});
	},
});

export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 200, // Limit each IP to 200 general requests per windowMs
	standardHeaders: "draft-7",
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(status.TOO_MANY_REQUESTS).json({
			success: false,
			statusCode: status.TOO_MANY_REQUESTS,
			message: "Too many requests from this IP. Please try again later.",
			data: null,
		});
	},
});

export default {
	authLimiter,
	submissionLimiter,
	apiLimiter,
};
