import { Router } from "express";
import usersRoute from "../modules/users/users.route.js";

const mainRouter = Router();

const moduleRoutes = [
	{
		path: "/users",
		route: usersRoute,
	},
];

moduleRoutes.forEach((route) => {
	mainRouter.use(route.path, route.route);
});

export default mainRouter;
