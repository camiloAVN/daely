import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { prisma } from "./prisma";

/** URL pública: BETTER_AUTH_URL si existe, si no el dominio de producción que da Vercel */
function resolveBaseURL() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

// Deploys de preview de Vercel (cada uno tiene su propio dominio)
const trustedOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL]
  .filter(Boolean)
  .map((host) => `https://${host}`);

export const auth = betterAuth({
  baseURL: resolveBaseURL(),
  trustedOrigins,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Solo existe el admin creado con el seed; nadie más puede registrarse.
    disableSignUp: true,
    minPasswordLength: 8,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 días
  },
  rateLimit: {
    enabled: true,
    // En serverless la memoria no se comparte entre instancias: guardamos el conteo en Postgres
    storage: "database",
    window: 60,
    max: 60,
    customRules: {
      // Contra fuerza bruta: máximo 5 intentos de login cada 5 minutos por IP
      "/sign-in/email": { window: 300, max: 5 },
    },
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-vercel-forwarded-for", "x-real-ip", "x-forwarded-for"],
    },
  },
  plugins: [nextCookies()],
});

/** Devuelve la sesión actual o null. Úsalo en Server Components y Route Handlers. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
