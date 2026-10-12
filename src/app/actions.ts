"use server";

import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { clean, normalizeInstagram, validateLead, type LeadErrors, type LeadInput } from "@/lib/leads";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, createFormToken, getClientIp, hashIp, verifyFormToken } from "@/lib/security";

export type SubmitLeadResult =
  | { ok: true }
  | { ok: false; errors: LeadErrors; message?: string; code?: "expired" | "rate_limited" };

/** Errores de conexión pasajeros (pool lleno, base saturada) que vale la pena reintentar */
function isTransient(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ["P1001", "P1002", "P1017", "P2024", "P2034"].includes(error.code);
  }
  return (
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Error && /timeout|ECONNRESET|too many (connections|clients)/i.test(error.message))
  );
}

/** Reintenta con espera creciente y aleatoria para que los picos de tráfico no se pierdan */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i >= attempts || !isTransient(error)) throw error;
      await new Promise((r) => setTimeout(r, 200 * 2 ** i + Math.random() * 300));
    }
  }
}

/** Token firmado que el formulario pide al montarse. Sirve de trampa de tiempo contra bots. */
export async function getFormToken() {
  return createFormToken();
}

export async function submitLead(
  input: LeadInput,
  token: string,
  /** Campo trampa invisible: los humanos lo dejan vacío */
  website: string,
): Promise<SubmitLeadResult> {
  // 1. Honeypot: un bot lo llenó. Le respondemos "ok" para que no sepa que fue detectado.
  if (typeof website !== "string" || website.length > 0) return { ok: true };

  // 2. Token anti-bot
  const tokenCheck = verifyFormToken(token);
  if (tokenCheck === "expired") {
    return { ok: false, errors: {}, code: "expired" };
  }
  if (tokenCheck !== "ok") {
    return { ok: false, errors: {}, message: "Ups, inténtalo de nuevo en unos segundos ✦" };
  }

  // 3. Validación estricta del lado del servidor (nunca confiar en el cliente)
  const data: LeadInput = {
    name: clean(input?.name),
    phone: clean(input?.phone),
    email: clean(input?.email),
    instagram: clean(input?.instagram),
  };
  const errors = validateLead(data);
  if (Object.keys(errors).length > 0) return { ok: false, errors };

  // 4. Límite de envíos por IP
  const ipHash = hashIp(getClientIp(await headers()));
  // Si la base está saturada y el conteo falla, dejamos pasar: es peor perder un registro real
  const allowed = await consumeRateLimit(ipHash).catch((error) => {
    console.error("consumeRateLimit", error);
    return true;
  });
  if (!allowed) {
    return {
      ok: false,
      errors: {},
      code: "rate_limited",
      message: "Demasiados intentos. Espera unos minutos ✦",
    };
  }

  try {
    await withRetry(() =>
      prisma.lead.create({
        data: {
          name: data.name,
          phone: data.phone,
          email: data.email.toLowerCase(),
          instagram: normalizeInstagram(data.instagram) || null,
        },
      }),
    );
    return { ok: true };
  } catch (error) {
    // Correo ya registrado: respondemos igual que un éxito para no revelar qué correos
    // existen y sin sobrescribir los datos originales.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: true };
    }
    console.error("submitLead", error);
    return { ok: false, errors: {}, message: "Algo salió mal, inténtalo de nuevo ✦" };
  }
}
