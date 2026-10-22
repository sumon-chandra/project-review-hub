import type { Response } from "express";

export interface ResponseMeta {
	page?: number;
	limit?: number;
	total?: number;
	totalPage?: number;
	[key: string]: unknown;
}

export interface ResponseData<T> {
	statusCode: number;
	success: boolean;
	message: string;
	data?: T;
	meta?: ResponseMeta | null;
}

export const sendResponse = <T>(res: Response, data: ResponseData<T>) => {
	res.status(data.statusCode).json({
		success: data.success,
		statusCode: data.statusCode,
		message: data.message,
		data: data.data,
		meta: data.meta ?? null,
	});
};

export default sendResponse;
