import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
   
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error("Database not configured. Set DATABASE_URL.");
  }

  return new PrismaClient({
    adapter: new PrismaPg(connectionString),
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

let prisma: PrismaClient | undefined = globalForPrisma.prisma;

export function getPrisma() {
  if (!prisma) {
    if (!process.env.DATABASE_URL?.trim()) {
      throw new Error("Database not configured. Set DATABASE_URL.");
    }

    prisma = createPrismaClient();

    if (process.env.NODE_ENV !== "production") {
      globalForPrisma.prisma = prisma;
    }
  }

  return prisma;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
