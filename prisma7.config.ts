import "dotenv/config";
import { defineConfig } from "prisma/config";
import envConfigs from "./src/configs/env-configs";

export default defineConfig({
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: envConfigs.databaseUrl,
  },
});
