import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export const validateRequest = (schema: ZodType) => {
	return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		try {
			const parsed = (await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
				cookies: req.cookies,
			})) as Record<string, unknown>;

			if (parsed && typeof parsed === "object") {
				if ("body" in parsed && parsed.body !== undefined) {
					req.body = parsed.body;
				}
				if ("query" in parsed && parsed.query !== undefined) {
					Object.defineProperty(req, "query", {
						value: parsed.query,
						writable: true,
						configurable: true,
						enumerable: true,
					});
				}
				if ("params" in parsed && parsed.params !== undefined) {
					Object.defineProperty(req, "params", {
						value: parsed.params,
						writable: true,
						configurable: true,
						enumerable: true,
					});
				}
			}

			next();
		} catch (error) {
			next(error);
		}
	};
};

export default validateRequest;
