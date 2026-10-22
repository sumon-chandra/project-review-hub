import type { Role } from "../../generated/prisma/enums.js";

export interface AuthUser {
	id: string;
	email: string;
	role: Role;
	name: string;
}

export interface JwtPayload {
	id: string;
	email: string;
	role: Role;
	iat?: number;
	exp?: number;
}

declare global {
	namespace Express {
		interface Request {
			user?: AuthUser;
		}
	}
}
