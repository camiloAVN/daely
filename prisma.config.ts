import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Las migraciones necesitan conexión directa (sin pooler).
    // DATABASE_POSTGRES_URL es la que crea Prisma Postgres en Vercel con el prefijo "DATABASE".
    url:
      process.env["DATABASE_URL_UNPOOLED"] ??
      process.env["DATABASE_URL"] ??
      process.env["DATABASE_POSTGRES_URL"],
  },
});
