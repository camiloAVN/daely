"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { getFormToken, submitLead } from "@/app/actions";
import { LIMITS, validateLead, type LeadInput } from "@/lib/leads";
import { useAppStore } from "@/store/useAppStore";
import { PaparazziFlashes } from "./PaparazziFlashes";
import { SparkleStar } from "./Sparkles";

type FieldConfig = {
  key: keyof LeadInput;
  label: string;
  placeholder: string;
  type: string;
  autoComplete: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  optional?: boolean;
  prefix?: string;
};

const FIELDS: FieldConfig[] = [
  { key: "name", label: "Nombre", placeholder: "¿Cómo te llamas?", type: "text", autoComplete: "name" },
  {
    key: "phone",
    label: "Teléfono",
    placeholder: "+57 300 123 4567",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
  },
  {
    key: "email",
    label: "Correo",
    placeholder: "tu@correo.com",
    type: "email",
    autoComplete: "email",
    inputMode: "email",
  },
  {
    key: "instagram",
    label: "Instagram",
    placeholder: "tu_usuario",
    type: "text",
    autoComplete: "off",
    optional: true,
    prefix: "@",
  },
];

export function LeadForm() {
  const router = useRouter();
  const form = useAppStore((s) => s.form);
  const errors = useAppStore((s) => s.errors);
  const setField = useAppStore((s) => s.setField);
  const setErrors = useAppStore((s) => s.setErrors);
  const resetForm = useAppStore((s) => s.resetForm);
  const setFanName = useAppStore((s) => s.setFanName);

  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [celebrate, setCelebrate] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot
  const token = useRef<Promise<string> | null>(null);

  useEffect(() => {
    token.current = getFormToken();
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const clientErrors = validateLead(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    startTransition(async () => {
      token.current ??= getFormToken();
      let result = await submitLead(form, await token.current, website);
      if (!result.ok && result.code === "expired") {
        // La página estuvo abierta mucho tiempo: pedimos un token nuevo y reintentamos
        token.current = getFormToken();
        await new Promise((r) => setTimeout(r, 2100));
        result = await submitLead(form, await token.current, website);
      }
      if (!result.ok) {
        setErrors(result.errors);
        if (result.message) setMessage(result.message);
        return;
      }
      setFanName(form.name.trim().split(/\s+/)[0]);
      setCelebrate(true);
      await new Promise((r) => setTimeout(r, 650));
      resetForm();
      router.push("/gracias");
    });
  };

  return (
    <>
      {celebrate && <PaparazziFlashes every={140} screenFlashChance={0.5} burstOnMount />}

      <div className="rise w-full max-w-md" style={{ "--delay": "450ms" } as React.CSSProperties}>
      <div className="chrome-frame">
        <form onSubmit={onSubmit} noValidate className="chrome-frame-inner relative overflow-hidden px-7 pb-9 pt-10 sm:px-10">
          <div className="glitter pointer-events-none absolute inset-0 opacity-60" aria-hidden />

          {/* Diamantes en las esquinas */}
          {["left-4 top-4", "right-4 top-4", "left-4 bottom-4", "right-4 bottom-4"].map((pos) => (
            <SparkleStar
              key={pos}
              size={10}
              className={`absolute ${pos} text-white/70 drop-shadow-[0_0_6px_white]`}
            />
          ))}

          <div className="relative mb-8 flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.45em] text-silver/80">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-white/60" />
            Guest list
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-white/60" />
          </div>

          {/* Trampa para bots: invisible para personas y lectores de pantalla */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Sitio web
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          <div className="relative flex flex-col gap-7">
            {FIELDS.map((f, i) => (
              <label
                key={f.key}
                className="glam-field rise block"
                data-error={!!errors[f.key]}
                style={{ "--delay": `${650 + i * 120}ms` } as React.CSSProperties}
              >
                <span className="glam-label flex items-baseline gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-muted transition">
                  <span className="font-display text-sm italic tracking-normal text-white/50">
                    0{i + 1}
                  </span>
                  {f.label}
                  {f.optional && <span className="tracking-[0.2em] text-white/30 normal-case">(opcional)</span>}
                </span>
                <span className="flex items-center">
                  {f.prefix && <span className="mr-1 text-lg font-light text-white/40">{f.prefix}</span>}
                  <input
                    name={f.key}
                    type={f.type}
                    inputMode={f.inputMode}
                    autoComplete={f.autoComplete}
                    placeholder={f.placeholder}
                    maxLength={LIMITS[f.key]}
                    value={form[f.key]}
                    onChange={(e) => setField(f.key, e.target.value)}
                    aria-invalid={!!errors[f.key]}
                    aria-describedby={errors[f.key] ? `${f.key}-error` : undefined}
                    className="glam-input"
                  />
                </span>
                <span className="glam-line" />
                {errors[f.key] && (
                  <span id={`${f.key}-error`} className="absolute -bottom-5 left-0 text-[11px] text-rose">
                    {errors[f.key]}
                  </span>
                )}
              </label>
            ))}
          </div>

          {message && <p className="relative mt-6 text-center text-xs text-rose">{message}</p>}

          <div className="rise mt-11" style={{ "--delay": "1200ms" } as React.CSSProperties}>
          <button
            type="submit"
            disabled={pending || celebrate}
            className="chrome-btn relative w-full py-4 text-xs font-bold uppercase tracking-[0.4em]"
          >
            <span className="relative inline-flex items-center gap-3">
              {pending || celebrate ? (
                <>Enviando<span className="dots" /></>
              ) : (
                <>
                  <SparkleStar size={12} />
                  Quiero ser VIP
                  <SparkleStar size={12} />
                </>
              )}
            </span>
          </button>
          </div>

          <p className="relative mt-5 text-center text-[10px] tracking-[0.15em] text-white/35">
            Tus datos están seguros. Solo te escribiremos con cosas lindas ♡
          </p>
        </form>
      </div>
      </div>
    </>
  );
}
