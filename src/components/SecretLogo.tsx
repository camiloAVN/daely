"use client";

import Image from "next/image";
import { useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

const HOLD_MS = 3000;

/** Logo de Daely. Mantenerlo presionado 3 segundos abre el acceso al dashboard. */
export function SecretLogo({ className = "" }: { className?: string }) {
  const setAdminOpen = useAppStore((s) => s.setAdminOpen);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = () => {
    cancel();
    timer.current = setTimeout(() => {
      timer.current = null;
      navigator.vibrate?.(40);
      setAdminOpen(true);
    }, HOLD_MS);
  };

  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return (
    <div
      className={`no-callout relative cursor-default ${className}`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <Image
        src="/logo_daely.png"
        alt="DAELY"
        width={1659}
        height={948}
        priority
        draggable={false}
        sizes="(max-width: 640px) 80vw, 420px"
        className="pointer-events-none h-auto w-full drop-shadow-[0_0_30px_rgba(255,255,255,0.25)]"
      />
    </div>
  );
}
