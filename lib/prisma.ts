import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

let client: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!client) {
    const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || "file:./prisma/dev.db",
    });
    client = new PrismaClient({
      adapter,
      log: ["query", "info", "warn", "error"],
    });
  }

  return client;
}
