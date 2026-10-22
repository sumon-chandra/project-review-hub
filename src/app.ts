import express, { Request, Response } from "express";
import cors from "cors";
import envConfigs from "./configs/env-configs.js";
import globalErrorHandler from "./middlewares/global-error-handler.js";
import notFoundHandler from "./middlewares/not-found.js";
import mainRouter from "./routes/index.js";

const app = express();

app.use(
	cors({
		origin: [envConfigs.corsOrigin, "http://localhost:3000", "http://localhost:5173"],
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Welcome to ProjectReview Hub API.",
	});
});

app.use("/api/v1", mainRouter);

// Not found and global error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
