// prisma.config.ts

import "dotenv/config"; 
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // DATABASE_URL from .env
    url: env("DATABASE_URL"),
  },
});
