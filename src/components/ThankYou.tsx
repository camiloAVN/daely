"use client";

import Image from "next/image";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/config/social";
import { useAppStore } from "@/store/useAppStore";
import { PaparazziFlashes } from "./PaparazziFlashes";
import { InstagramIcon, SpotifyIcon, YoutubeIcon } from "./SocialIcons";
import { Sparkles } from "./Sparkles";
import { Vinyl } from "./Vinyl";

const LINKS = [
  { name: "Instagram", hint: "Sígueme", href: SOCIAL_LINKS.instagram, Icon: InstagramIcon, glow: "rgba(225,48,108,0.55)" },
  { name: "Spotify", hint: "Escúchame", href: SOCIAL_LINKS.spotify, Icon: SpotifyIcon, glow: "rgba(30,215,96,0.5)" },
  { name: "YouTube", hint: "Mira mis videos", href: SOCIAL_LINKS.youtube, Icon: YoutubeIcon, glow: "rgba(255,0,0,0.5)" },
];

export function ThankYou() {
  const fanName = useAppStore((s) => s.fanName);

  return (
    <main className="stage-bg safe-x relative flex min-h-dvh flex-1 flex-col items-center justify-center overflow-hidden py-[max(3.5rem,env(safe-area-inset-top))]">
      <div className="light-rays pointer-events-none absolute inset-0" />
      <Sparkles count={44} />
      <PaparazziFlashes every={1400} screenFlashChance={0.05} burstOnMount />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="rise" style={{ "--delay": "0ms" } as React.CSSProperties}>
          <Vinyl size="150px" />
        </div>

        <p
          className="rise mt-10 text-[10px] font-semibold uppercase tracking-[0.55em] text-silver/70"
          style={{ "--delay": "150ms" } as React.CSSProperties}
        >
          ✦ Ya estás en la lista ✦
        </p>

        <h1
          className="rise mt-4 font-display text-[clamp(2.6rem,13vw,3.75rem)] leading-[1.05] break-words"
          style={{ "--delay": "300ms" } as React.CSSProperties}
        >
          <span className="chrome-text">¡Gracias</span>
          {fanName && (
            <>
              <span className="chrome-text">,</span>
              <br />
              <span className="holo-text italic">{fanName}</span>
            </>
          )}
          <span className="chrome-text">!</span>
        </h1>

        <p
          className="rise mt-5 max-w-xs text-sm font-light leading-relaxed text-silver/75"
          style={{ "--delay": "450ms" } as React.CSSProperties}
        >
          Gracias por tu información. Prepárate para enterarte primero de todo lo que viene ✦
        </p>

        <div className="mt-10 flex w-full flex-col gap-4">
          {LINKS.map(({ name, hint, href, Icon, glow }, i) => (
            <div key={name} className="rise" style={{ "--delay": `${650 + i * 130}ms` } as React.CSSProperties}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="chrome-frame group block !rounded-full transition-transform duration-300 hover:-translate-y-1"
                style={{ "--glow": glow } as React.CSSProperties}
              >
                <span className="chrome-frame-inner flex items-center gap-4 !rounded-full px-6 py-4 transition-shadow duration-300 group-hover:shadow-[0_0_40px_-4px_var(--glow)]">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/5 text-white ring-1 ring-white/20 transition group-hover:bg-white group-hover:text-black">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="flex flex-col items-start">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-muted">{hint}</span>
                    <span className="font-display text-xl italic text-white">{name}</span>
                  </span>
                  <span className="ml-auto text-white/40 transition group-hover:translate-x-1 group-hover:text-white">→</span>
                </span>
              </a>
            </div>
          ))}
        </div>

        <div className="rise mt-12 w-40 opacity-80" style={{ "--delay": "1100ms" } as React.CSSProperties}>
          <Image src="/logo_daely.png" alt="DAELY" width={1659} height={948} sizes="160px" className="h-auto w-full" />
        </div>

        <Link
          href="/"
          className="mt-6 text-[10px] uppercase tracking-[0.35em] text-muted transition hover:text-white"
        >
          Volver
        </Link>
      </div>
    </main>
  );
}
