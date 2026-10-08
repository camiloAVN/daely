"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useAppStore } from "@/store/useAppStore";
import { SparkleStar } from "./Sparkles";

export function AdminLoginModal() {
  const router = useRouter();
  const open = useAppStore((s) => s.adminOpen);
  const setOpen = useAppStore((s) => s.setAdminOpen);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Si ya hay sesión activa, directo al dashboard
    authClient.getSession().then(({ data }) => {
      if (data) {
        setOpen(false);
        router.push("/dashboard");
      }
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, router, setOpen]);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await authClient.signIn.email({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      setError("Correo o contraseña incorrectos");
      return;
    }
    setOpen(false);
    router.push("/dashboard");
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/85 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-title"
        className="chrome-frame modal-pop w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={onSubmit} className="chrome-frame-inner flex flex-col gap-6 px-7 py-9">
          <div className="flex flex-col items-center gap-2 text-center">
            <SparkleStar size={22} className="text-white drop-shadow-[0_0_10px_white]" />
            <h2 id="admin-title" className="chrome-text font-display text-3xl italic">
              Backstage
            </h2>
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted">Solo personal autorizado</p>
          </div>

          <label className="glam-field block">
            <span className="glam-label text-[10px] font-semibold uppercase tracking-[0.35em] text-muted transition">
              Correo
            </span>
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glam-input"
            />
            <span className="glam-line" />
          </label>

          <label className="glam-field block">
            <span className="glam-label text-[10px] font-semibold uppercase tracking-[0.35em] text-muted transition">
              Contraseña
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glam-input"
            />
            <span className="glam-line" />
          </label>

          {error && <p className="text-center text-xs text-rose">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="chrome-btn py-3.5 text-xs font-bold uppercase tracking-[0.35em]"
          >
            <span className="relative">{loading ? "Entrando…" : "Entrar"}</span>
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-[10px] uppercase tracking-[0.35em] text-muted transition hover:text-white"
          >
            Cerrar
          </button>
        </form>
      </div>
    </div>
  );
}
