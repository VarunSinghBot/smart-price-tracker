import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Load environment variables
dotenv.config({ path: "./.env" });

// Create a singleton Prisma Client instance
const globalForPrisma = global;

let prisma;

if (globalForPrisma.prisma) {
    prisma = globalForPrisma.prisma;
} else {
    // Create PostgreSQL connection pool
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    });

    // Create Prisma adapter
    const adapter = new PrismaPg(pool);

    // Initialize Prisma Client with adapter
    prisma = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

    if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prisma;
    }
}

export default prisma;
