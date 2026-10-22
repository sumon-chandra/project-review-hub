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
    access_secret: process.env.JWT_ACCESS_SECRET as string,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN as string,
    refresh_secret: process.env.JWT_REFRESH_SECRET as string,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN as string,
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
