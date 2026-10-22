import { Router } from "express";
import authRoute from "../modules/auth/auth.route.js";
import usersRoute from "../modules/users/users.route.js";
import submissionsRoute from "../modules/submissions/submissions.route.js";
import mentorRoute from "../modules/mentor/mentor.route.js";

const mainRouter = Router();

const moduleRoutes = [
	{
		path: "/auth",
		route: authRoute,
	},
	{
		path: "/users",
		route: usersRoute,
	},
	{
		path: "/submissions",
		route: submissionsRoute,
	},
	{
		path: "/mentor",
		route: mentorRoute,
	},
];

moduleRoutes.forEach((route) => {
	mainRouter.use(route.path, route.route);
});

export default mainRouter;
