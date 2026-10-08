export type LeadInput = {
  name: string;
  phone: string;
  email: string;
  instagram: string;
};

export type LeadErrors = Partial<Record<keyof LeadInput, string>>;

export const LIMITS = { name: 80, phone: 20, email: 254, instagram: 60 } as const;

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
// Letras de cualquier idioma, espacios, punto, apóstrofo y guion. Debe empezar con letra
// (esto también evita fórmulas tipo "=HYPERLINK(...)" al abrir el Excel).
const NAME_RE = /^\p{L}[\p{L}\p{M} .'’-]*$/u;
const PHONE_RE = /^\+?[\d\s().-]+$/;
const IG_RE = /^[a-zA-Z0-9._]{1,30}$/;

/** Quita caracteres de control e invisibles y colapsa espacios */
export function clean(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁯﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Quita @, espacios y URLs para quedarse solo con el usuario de Instagram */
export function normalizeInstagram(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/^@+/, "");
}

export function validateLead(input: LeadInput): LeadErrors {
  const errors: LeadErrors = {};
  const name = clean(input.name);
  const phone = clean(input.phone);
  const email = clean(input.email);
  const ig = normalizeInstagram(clean(input.instagram));
  const digits = phone.replace(/\D/g, "");

  if (name.length < 2) errors.name = "Cuéntanos tu nombre";
  else if (name.length > LIMITS.name) errors.name = "Nombre demasiado largo";
  else if (!NAME_RE.test(name)) errors.name = "Usa solo letras";

  if (!PHONE_RE.test(phone) || digits.length < 7 || digits.length > 15 || phone.length > LIMITS.phone)
    errors.phone = "Número de teléfono inválido";

  if (email.length > LIMITS.email || !EMAIL_RE.test(email)) errors.email = "Correo inválido";

  if (ig && !IG_RE.test(ig)) errors.instagram = "Usuario de Instagram inválido";

  return errors;
}
