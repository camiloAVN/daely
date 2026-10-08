"use client";

import { useEffect, useRef, useState } from "react";

type Flash = { id: number; x: number; y: number; size: number; rot: number };

type Props = {
  /** Milisegundos promedio entre ráfagas */
  every?: number;
  /** Probabilidad de que una ráfaga ilumine toda la pantalla */
  screenFlashChance?: number;
  /** Ráfaga fuerte al montar */
  burstOnMount?: boolean;
};

/** Posición pegada a los bordes de la pantalla, donde estarían los fotógrafos */
function edgePosition() {
  const side = Math.floor(Math.random() * 4);
  const along = Math.random() * 100;
  const depth = Math.random() * 22;
  switch (side) {
    case 0:
      return { x: along, y: depth };
    case 1:
      return { x: 100 - depth, y: along };
    case 2:
      return { x: along, y: 100 - depth };
    default:
      return { x: depth, y: along };
  }
}

export function PaparazziFlashes({ every = 450, screenFlashChance = 0.18, burstOnMount = false }: Props) {
  const [flashes, setFlashes] = useState<Flash[]>([]);
  const [screenFlash, setScreenFlash] = useState(0);
  const nextId = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Flashes más pequeños en pantallas angostas para que no tapen el contenido
    const scale = Math.min(1, Math.max(0.55, window.innerWidth / 1000));
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let alive = true;

    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        timers.delete(t);
        if (alive) fn();
      }, ms);
      timers.add(t);
    };

    const pop = () => {
      const id = nextId.current++;
      const { x, y } = edgePosition();
      const size = (110 + Math.random() * 200) * scale;
      setFlashes((f) => [...f, { id, x, y, size, rot: Math.random() * 90 }]);
      later(() => setFlashes((f) => f.filter((fl) => fl.id !== id)), 560);
    };

    const burst = () => {
      // Los paparazzi disparan en ráfagas de 1 a 4 fotos seguidas
      const shots = 1 + Math.floor(Math.random() * 4);
      for (let i = 0; i < shots; i++) later(pop, i * (60 + Math.random() * 90));
      if (!reduced && Math.random() < screenFlashChance) setScreenFlash((n) => n + 1);
    };

    const loop = () => {
      burst();
      later(loop, (reduced ? every * 3 : every) * (0.4 + Math.random() * 1.2));
    };

    if (burstOnMount) {
      for (let i = 0; i < 6; i++) later(pop, i * 70);
      if (!reduced) later(() => setScreenFlash((n) => n + 1), 0);
    }
    later(loop, every * 0.5);

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [every, screenFlashChance, burstOnMount]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {flashes.map((f) => (
        <div key={f.id} className="flash" style={{ left: `${f.x}%`, top: `${f.y}%`, width: f.size, height: f.size }}>
          <div className="flash-core" />
          <div className="flash-streak" style={{ "--r": `${f.rot}deg` } as React.CSSProperties} />
          <div className="flash-streak" style={{ "--r": `${f.rot + 90}deg` } as React.CSSProperties} />
          <div
            className="flash-streak opacity-50"
            style={{ "--r": `${f.rot + 45}deg`, width: "120%" } as React.CSSProperties}
          />
          <div
            className="flash-streak opacity-50"
            style={{ "--r": `${f.rot + 135}deg`, width: "120%" } as React.CSSProperties}
          />
        </div>
      ))}
      {screenFlash > 0 && <div key={screenFlash} className="screen-flash absolute inset-0 bg-white" />}
    </div>
  );
}
