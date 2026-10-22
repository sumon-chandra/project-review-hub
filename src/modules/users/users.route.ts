import { Router } from "express";
import { usersControllers } from "./users.controller.js";

const usersRoute = Router();

usersRoute.get("/", usersControllers.getAllUsers);

export default usersRoute;
