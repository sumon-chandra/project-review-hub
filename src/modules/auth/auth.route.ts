import { Router } from "express";
import { authControllers } from "./auth.controller.js";
import { authValidation } from "./auth.validation.js";
import validateRequest from "../../middlewares/validate-request.js";
import { auth } from "../../middlewares/auth.js";
import { authLimiter } from "../../middlewares/rate-limiter.js";

const authRoute = Router();

authRoute.post(
	"/signup",
	authLimiter,
	validateRequest(authValidation.signupSchema),
	authControllers.signup,
);

authRoute.post(
	"/login",
	authLimiter,
	validateRequest(authValidation.loginSchema),
	authControllers.login,
);

authRoute.get(
	"/me",
	auth(),
	authControllers.getMe,
);

export default authRoute;
