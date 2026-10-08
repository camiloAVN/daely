"use client";

import { useEffect, useState } from "react";

type Sparkle = { id: number; x: number; y: number; size: number; d: number; delay: number };

/** Estrella de 4 puntas tipo destello de diamante */
export function SparkleStar({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 0C12.6 6.6 17.4 11.4 24 12 17.4 12.6 12.6 17.4 12 24 11.4 17.4 6.6 12.6 0 12 6.6 11.4 11.4 6.6 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

function randomSparkles(count: number): Sparkle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 6 + Math.random() * 18,
    d: 2 + Math.random() * 3,
    delay: Math.random() * 5,
  }));
}

/** Capa de destellos aleatorios que titilan por toda el área del contenedor */
export function Sparkles({ count = 28, className = "" }: { count?: number; className?: string }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    // Se generan en el cliente para no romper la hidratación
    // En celulares la mitad de destellos: se ve igual de lleno y cuesta menos batería
    const total = window.innerWidth < 640 ? Math.ceil(count / 2) : count;
    const frame = requestAnimationFrame(() => setSparkles(randomSparkles(total)));
    return () => cancelAnimationFrame(frame);
  }, [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden text-white ${className}`} aria-hidden>
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="sparkle"
          style={
            {
              left: `${s.x}%`,
              top: `${s.y}%`,
              "--d": `${s.d}s`,
              "--delay": `${s.delay}s`,
              filter: `drop-shadow(0 0 ${s.size / 2}px rgba(255,255,255,0.9))`,
            } as React.CSSProperties
          }
        >
          <SparkleStar size={s.size} />
        </span>
      ))}
    </div>
  );
}
