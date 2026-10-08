"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { TIME_ZONE } from "@/config/social";
import { authClient } from "@/lib/auth-client";

export type DashboardLead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  instagram: string | null;
  createdAt: Date;
};

const dateFmt = new Intl.DateTimeFormat("es-CO", {
  timeZone: TIME_ZONE,
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE });

export function DashboardView({ leads, adminEmail }: { leads: DashboardLead[]; adminEmail: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [refreshing, startRefresh] = useTransition();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const numbered = leads.map((l, i) => ({ ...l, n: leads.length - i }));
    if (!q) return numbered;
    return numbered.filter((l) =>
      [l.name, l.email, l.phone, l.instagram ?? ""].some((v) => v.toLowerCase().includes(q)),
    );
  }, [leads, query]);

  const stats = useMemo(() => {
    const today = dayKey.format(new Date());
    return {
      total: leads.length,
      today: leads.filter((l) => dayKey.format(new Date(l.createdAt)) === today).length,
      withInstagram: leads.filter((l) => l.instagram).length,
    };
  }, [leads]);

  const signOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <main className="stage-bg safe-x relative min-h-dvh flex-1 py-[max(2rem,env(safe-area-inset-top))] sm:px-8">
      <div className="light-rays pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Encabezado */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image src="/logo_daely.png" alt="DAELY" width={1659} height={948} sizes="130px" className="h-auto w-28 sm:w-32" />
            <div className="border-l border-white/15 pl-4">
              <p className="font-display text-2xl italic text-white">Lista VIP</p>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted">{adminEmail}</p>
            </div>
          </div>
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <a
              href="/api/leads/export"
              download
              className="chrome-btn inline-flex flex-1 items-center justify-center gap-2 px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] sm:flex-none"
            >
              <span className="relative inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Descargar Excel
              </span>
            </a>
            <button
              onClick={signOut}
              className="rounded-full px-5 py-3.5 text-[11px] uppercase tracking-[0.25em] text-muted ring-1 ring-white/15 transition hover:text-white hover:ring-white/40"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Métricas */}
        <section className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: "Registros totales", value: stats.total },
            { label: "Registros hoy", value: stats.today },
            { label: "Con Instagram", value: stats.withInstagram },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/[0.03] px-3 py-4 ring-1 ring-white/10 sm:px-6 sm:py-5">
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted sm:text-[10px] sm:tracking-[0.3em]">{s.label}</p>
              <p className="chrome-text mt-2 font-display text-3xl tabular-nums sm:text-4xl">{s.value}</p>
            </div>
          ))}
        </section>

        {/* Tabla */}
        <section className="overflow-hidden rounded-2xl bg-black/60 ring-1 ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              aria-label="Buscar por nombre, correo, teléfono o Instagram"
              className="w-full rounded-full bg-white/5 px-4 py-2.5 text-base sm:max-w-sm sm:text-sm text-white outline-none ring-1 ring-white/10 placeholder:text-white/30 focus:ring-white/40"
            />
            <button
              onClick={() => startRefresh(() => router.refresh())}
              className="text-[10px] uppercase tracking-[0.3em] text-muted transition hover:text-white"
            >
              {refreshing ? "Actualizando…" : "↻ Actualizar"}
            </button>
          </div>

          {/* Celular: tarjetas */}
          <ul className="divide-y divide-white/5 sm:hidden">
            {filtered.map((l) => (
              <li key={l.id} className="flex flex-col gap-1.5 px-5 py-4 text-sm text-silver">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium text-white">{l.name}</span>
                  <span className="shrink-0 text-[11px] text-muted">{dateFmt.format(new Date(l.createdAt))}</span>
                </div>
                <a href={`tel:${l.phone.replace(/[^\d+]/g, "")}`} className="tabular-nums">
                  {l.phone}
                </a>
                <a href={`mailto:${l.email}`} className="break-all">
                  {l.email}
                </a>
                {l.instagram && (
                  <a
                    href={`https://instagram.com/${l.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70"
                  >
                    @{l.instagram}
                  </a>
                )}
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-5 py-14 text-center text-sm text-muted">
                {leads.length === 0 ? "Aún no hay registros ✦" : "Sin resultados para tu búsqueda"}
              </li>
            )}
          </ul>

          {/* Escritorio: tabla */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.25em] text-muted">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="px-5 py-3 font-semibold">Nombre</th>
                  <th className="px-5 py-3 font-semibold">Teléfono</th>
                  <th className="px-5 py-3 font-semibold">Correo</th>
                  <th className="px-5 py-3 font-semibold">Instagram</th>
                  <th className="px-5 py-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-t border-white/5 text-silver transition hover:bg-white/[0.04]">
                    <td className="px-5 py-3 tabular-nums text-white/30">{l.n}</td>
                    <td className="px-5 py-3 font-medium text-white">{l.name}</td>
                    <td className="px-5 py-3 tabular-nums">{l.phone}</td>
                    <td className="px-5 py-3">{l.email}</td>
                    <td className="px-5 py-3">
                      {l.instagram ? (
                        <a
                          href={`https://instagram.com/${l.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline decoration-white/20 underline-offset-4 hover:text-white"
                        >
                          @{l.instagram}
                        </a>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted">{dateFmt.format(new Date(l.createdAt))}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-sm text-muted">
                      {leads.length === 0 ? "Aún no hay registros ✦" : "Sin resultados para tu búsqueda"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
