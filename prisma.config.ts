import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  datasource: {
    url: env("DATABASE_URL"),
  },

  migrate: {
    async adapter() {
      const { Pool } = await import("pg");
      const { PrismaPg } = await import("@prisma/adapter-pg");

      // PrismaPg espera un postgres:// directo (no prisma:// ni prisma+postgres://)
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });

      return new PrismaPg(pool);
    },
  },
});
