"use server";

import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { clean, normalizeInstagram, validateLead, type LeadErrors, type LeadInput } from "@/lib/leads";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, createFormToken, getClientIp, hashIp, verifyFormToken } from "@/lib/security";

export type SubmitLeadResult =
  | { ok: true }
  | { ok: false; errors: LeadErrors; message?: string; code?: "expired" | "rate_limited" };

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
  if (!(await consumeRateLimit(ipHash))) {
    return {
      ok: false,
      errors: {},
      code: "rate_limited",
      message: "Demasiados intentos. Espera unos minutos ✦",
    };
  }

  try {
    await prisma.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email.toLowerCase(),
        instagram: normalizeInstagram(data.instagram) || null,
      },
    });
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
