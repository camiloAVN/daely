import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "./prisma";

/** Un humano necesita al menos este tiempo para llenar el formulario */
const MIN_FILL_MS = 2_000;
/** El token del formulario caduca a las 2 horas */
const MAX_TOKEN_AGE_MS = 2 * 60 * 60 * 1000;

/** Máximo de envíos por IP dentro de la ventana */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

function secret() {
  const value = process.env.BETTER_AUTH_SECRET;
  if (!value) throw new Error("Falta BETTER_AUTH_SECRET");
  return value;
}

function hmac(purpose: string, value: string) {
  return createHmac("sha256", secret()).update(`${purpose}:${value}`).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** IP del cliente. En Vercel estos encabezados los pone la plataforma y no se pueden falsificar. */
export function getClientIp(h: Headers) {
  return (
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

/** Hash del IP: permite limitar envíos sin almacenar datos personales del visitante */
export function hashIp(ip: string) {
  return hmac("ip", ip);
}

// ───────── Token anti-bot ─────────

export function createFormToken() {
  const issuedAt = Date.now().toString(36);
  return `${issuedAt}.${hmac("form", issuedAt)}`;
}

export type TokenCheck = "ok" | "invalid" | "too_fast" | "expired";

export function verifyFormToken(token: unknown): TokenCheck {
  if (typeof token !== "string" || token.length > 100) return "invalid";
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature || !safeEqual(signature, hmac("form", issuedAt))) return "invalid";

  const age = Date.now() - parseInt(issuedAt, 36);
  if (!Number.isFinite(age) || age < 0) return "invalid";
  if (age < MIN_FILL_MS) return "too_fast";
  if (age > MAX_TOKEN_AGE_MS) return "expired";
  return "ok";
}

// ───────── Rate limit (en base de datos para que funcione en serverless) ─────────

/** Registra el intento y devuelve false si el IP superó el límite */
export async function consumeRateLimit(ipHash: string) {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const recent = await prisma.formAttempt.count({
    where: { ipHash, createdAt: { gte: since } },
  });
  if (recent >= RATE_LIMIT_MAX) return false;

  await prisma.formAttempt.create({ data: { ipHash } });

  // Limpieza ocasional de intentos viejos
  if (Math.random() < 0.05) {
    await prisma.formAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
  }
  return true;
}
