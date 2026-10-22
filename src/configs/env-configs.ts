import dotenv from "dotenv";
import path from "path";

dotenv.config({
	path: path.join(process.cwd(), ".env"),
});

const envConfigs = {
	nodeEnv: process.env.NODE_ENV || "development",
	port: Number(process.env.PORT) || 5000,
	databaseUrl: process.env.DATABASE_URL || "",
	corsOrigin: process.env.FRONTEND_URL || "http://localhost:3000",
	jwt: {
		secret: process.env.JWT_SECRET || "default_jwt_secret_dev_only",
		expiresIn: process.env.JWT_EXPIRES_IN || "7d",
	},
	bcrypt: {
		saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
	},
	seedMentor: {
		email: process.env.MENTOR_EMAIL || "mentor@projectreviewhub.dev",
		password: process.env.MENTOR_PASSWORD || "MentorPassword123!",
		name: process.env.MENTOR_NAME || "Default Mentor",
	},
};

export default envConfigs;
