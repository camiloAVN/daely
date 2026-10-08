import Image from "next/image";

type Props = {
  size: string;
  speed?: "fast" | "slow";
  priority?: boolean;
  className?: string;
};

export function Vinyl({ size, speed = "fast", priority = false, className = "" }: Props) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div className="vinyl-glow absolute inset-0" />
      <Image
        src="/vinilo-daniela.png"
        alt="Vinilo Daely"
        fill
        priority={priority}
        sizes="340px"
        draggable={false}
        className={`select-none object-contain ${speed === "fast" ? "vinyl-spin" : "vinyl-spin-slow"}`}
      />
      {/* Reflejo de luz fijo: el disco gira debajo de él */}
      <div className="vinyl-sheen absolute inset-[3%]" />
    </div>
  );
}
