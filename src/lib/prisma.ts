import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? process.env.DATABASE_POSTGRES_URL,
    // Pocas conexiones por instancia: en serverless hay muchas instancias en paralelo
    max: process.env.VERCEL ? 3 : 10,
    // Si el pool está lleno, esperar un turno en vez de fallar de inmediato
    connectionTimeoutMillis: 10_000,
    // Soltar conexiones ociosas pronto para no agotar el límite de la base con picos de tráfico
    idleTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = prisma;
