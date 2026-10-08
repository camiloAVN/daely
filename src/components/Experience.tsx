"use client";

import { useAppStore } from "@/store/useAppStore";
import { AdminLoginModal } from "./AdminLoginModal";
import { IntroLoader } from "./IntroLoader";
import { LeadForm } from "./LeadForm";
import { PaparazziFlashes } from "./PaparazziFlashes";
import { SecretLogo } from "./SecretLogo";
import { Sparkles } from "./Sparkles";
import { Vinyl } from "./Vinyl";

export function Experience() {
  const introDone = useAppStore((s) => s.introDone);

  return (
    <>
      {!introDone && <IntroLoader />}

      {introDone && (
        <main className="stage-bg safe-x safe-b relative flex min-h-dvh flex-1 flex-col items-center overflow-hidden pt-[max(2.5rem,env(safe-area-inset-top))]">
          <div className="light-rays pointer-events-none absolute inset-0" />
          <Sparkles count={36} />
          {/* Unos cuantos flashes sueltos para mantener el ambiente de alfombra roja */}
          <PaparazziFlashes every={2600} screenFlashChance={0} />

          {/* Vinilos gigantes girando de fondo */}
          <div className="pointer-events-none absolute -bottom-32 -right-32 opacity-20 sm:-bottom-40 sm:-right-40 sm:opacity-25 sm:blur-[1px]">
            <Vinyl size="clamp(300px, 45vw, 520px)" speed="slow" />
          </div>
          <div className="pointer-events-none absolute -left-52 top-24 hidden opacity-15 blur-[2px] sm:block">
            <Vinyl size="420px" speed="slow" />
          </div>

          <div className="relative z-10 flex w-full flex-col items-center">
            <div className="rise w-[78vw] max-w-[400px]" style={{ "--delay": "0ms" } as React.CSSProperties}>
              <SecretLogo />
            </div>

            <div
              className="rise -mt-2 mb-10 flex max-w-md flex-col items-center gap-4 text-center"
              style={{ "--delay": "200ms" } as React.CSSProperties}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.55em] text-silver/70">
                ✦ Acceso exclusivo ✦
              </p>
              <h1 className="font-display text-[clamp(2.2rem,11vw,3rem)] leading-[1.05]">
                <span className="chrome-text">Entra a mi</span>{" "}
                <span className="holo-text italic">lista VIP</span>
              </h1>
              <p className="max-w-sm text-sm font-light leading-relaxed text-silver/70">
                Sé de las primeras personas en escuchar mis lanzamientos, ver el backstage y recibir
                sorpresas exclusivas.
              </p>
            </div>

            <LeadForm />
          </div>

          <AdminLoginModal />
        </main>
      )}
    </>
  );
}
