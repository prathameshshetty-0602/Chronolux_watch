import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // A non-secret local fallback lets Prisma Client generation run before .env is configured.
    // Prefer the provider's direct URL for migration commands when runtime uses a pooler.
    url: process.env.DIRECT_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim() || "postgresql://localhost:5432/chronolux",
  },
});
