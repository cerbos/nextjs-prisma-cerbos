import { PrismaClient } from "@prisma/client";

let client: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!client) {
    client = new PrismaClient({ log: ["query", "info", "warn", "error"] });
  }

  return client;
}
