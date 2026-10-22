import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import envConfigs from "../configs/env-configs.js";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const adapter = new PrismaPg({
	connectionString: envConfigs.databaseUrl,
});

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: envConfigs.nodeEnv === "development" ? ["error", "warn"] : ["error"],
	});

if (envConfigs.nodeEnv !== "production") {
	globalForPrisma.prisma = prisma;
}

export default prisma;
