"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { PaparazziFlashes } from "./PaparazziFlashes";
import { Sparkles } from "./Sparkles";
import { Vinyl } from "./Vinyl";

const INTRO_MS = 3800;
const EXIT_MS = 700;

export function IntroLoader() {
  const finishIntro = useAppStore((s) => s.finishIntro);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setExiting(true), INTRO_MS);
    const t2 = setTimeout(finishIntro, INTRO_MS + EXIT_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [finishIntro]);

  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`stage-bg fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden ${
        exiting ? "loader-exit fade-out" : ""
      }`}
    >
      <div className="light-rays absolute inset-0" />
      <Sparkles count={22} />
      <PaparazziFlashes every={320} screenFlashChance={0.22} />

      <div className="loader-vinyl relative z-10">
        <Vinyl size="min(62vw, 340px)" priority />
      </div>

      <div className="relative z-10 mt-12 flex w-56 flex-col items-center gap-4">
        <p className="dots text-[10px] font-medium uppercase tracking-[0.5em] text-silver/70">DAELY</p>
        <div className="h-px w-full overflow-hidden bg-white/10">
          <div
            className="progress-fill h-full origin-left"
            style={{ background: "var(--holo)", "--dur": `${INTRO_MS}ms` } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}
