import express, { Request, Response } from "express";
import globalErrorHandler from "./middlewares/global-error-handler.js";
import mainRouter from "./routes/index.js";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		message: "Welcome to the server.",
	});
});

app.use("/api/v1/", mainRouter);
app.use(globalErrorHandler);

export default app;
