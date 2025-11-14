'use client';

import type { CSSProperties, RefObject } from "react";
import { useEffect, useMemo, useRef } from "react";

type CameraVector = {
  x: number;
  y: number;
  rotateX: number;
  rotateY: number;
};

type NeonSign = {
  id: string;
  label: string;
  position: { top?: string; bottom?: string; left?: string; right?: string };
  rotation?: number;
  palette: string;
};

type RainDrop = {
  left: number;
  delay: number;
  duration: number;
  scale: number;
  brightness: number;
};

const pseudoRandom = (seed: number) => {
  const value = Math.sin(seed) * 10000;
  return value - Math.floor(value);
};

const neonSigns: NeonSign[] = [
  {
    id: "echo",
    label: "ECHO LOUNGE",
    position: { top: "12%", left: "10%" },
    rotation: -6,
    palette: "from-fuchsia-400 via-pink-500 to-purple-500",
  },
  {
    id: "aurora",
    label: "AURORA DREAMS",
    position: { top: "26%", right: "8%" },
    rotation: 8,
    palette: "from-cyan-300 via-sky-400 to-indigo-500",
  },
  {
    id: "noir",
    label: "NOIR STUDIO",
    position: { bottom: "28%", left: "18%" },
    rotation: -2,
    palette: "from-amber-300 via-orange-400 to-rose-500",
  },
];

const lensFlares = [
  { id: "flare-top", gradient: "from-cyan-300/70 via-purple-500/40 to-transparent", className: "left-[18%] top-[8%] h-48 w-48" },
  { id: "flare-middle", gradient: "from-pink-400/60 via-transparent to-blue-400/40", className: "right-[20%] top-[32%] h-56 w-56" },
  { id: "flare-bottom", gradient: "from-blue-500/30 via-fuchsia-400/35 to-transparent", className: "left-1/2 bottom-[14%] h-64 w-64 -translate-x-1/2" },
];

const buildingLayers = [
  {
    id: "layer-back",
    blur: "blur-3xl",
    opacity: "opacity-40",
    gradient: "from-blue-900/20 via-purple-900/30 to-fuchsia-900/30",
    translate: "-translate-y-[6%]",
  },
  {
    id: "layer-mid",
    blur: "blur-xl",
    opacity: "opacity-70",
    gradient: "from-sky-800/40 via-indigo-800/55 to-purple-800/45",
    translate: "",
  },
  {
    id: "layer-front",
    blur: "blur-md",
    opacity: "opacity-80",
    gradient: "from-blue-600/70 via-purple-700/80 to-pink-600/70",
    translate: "translate-y-[6%]",
  },
];

function useCameraParallax(sceneRef: RefObject<HTMLDivElement | null>) {
  const targetRef = useRef<CameraVector>({
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
  });

  const currentRef = useRef<CameraVector>({
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
  });

  useEffect(() => {
    let frame = 0;

    const animate = () => {
      const current = currentRef.current;
      const target = targetRef.current;
      const ease = 0.08;
      const time = performance.now() * 0.00035;

      const floatOffset = Math.sin(time) * 3.5;
      const sway = Math.cos(time * 1.4) * 2.75;

      current.x += (target.x + sway - current.x) * ease;
      current.y += (target.y + floatOffset - current.y) * ease;
      current.rotateX += (target.rotateX - current.rotateX) * ease;
      current.rotateY += (target.rotateY - current.rotateY) * ease;

      if (sceneRef.current) {
        sceneRef.current.style.transform = `translate3d(${current.x.toFixed(2)}px, ${current.y.toFixed(2)}px, 0) rotateX(${current.rotateX.toFixed(3)}deg) rotateY(${current.rotateY.toFixed(3)}deg)`;
      }

      frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frame);
  }, [sceneRef]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const { innerWidth, innerHeight } = window;
      const xRatio = event.clientX / innerWidth - 0.5;
      const yRatio = event.clientY / innerHeight - 0.5;

      targetRef.current = {
        x: xRatio * 36,
        y: yRatio * 26,
        rotateX: yRatio * -4.5,
        rotateY: xRatio * 7.5,
      };
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);
}

function RainLayer({ drops = 72 }: { drops?: number }) {
  const dropsConfig = useMemo<RainDrop[]>(() => {
    return Array.from({ length: drops }, (_, index) => ({
      left: pseudoRandom(index * 3.37 + drops * 0.618),
      delay: pseudoRandom(index * 5.11 + 12.7) * 2,
      duration: 1.2 + pseudoRandom(index * 7.43 + 4.2) * 1.1,
      scale: 0.55 + pseudoRandom(index * 11.92 + 1.7) * 0.9,
      brightness: 0.6 + pseudoRandom(index * 13.73 + 9.3) * 0.4,
    }));
  }, [drops]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dropsConfig.map((drop, index) => (
        <span
          key={index}
          className="rain-drop absolute h-28 w-px rounded-full bg-cyan-200/90"
          style={
            {
              left: `${drop.left * 100}%`,
              animationDuration: `${drop.duration}s`,
              animationDelay: `${drop.delay}s`,
              filter: `brightness(${drop.brightness})`,
              "--drop-scale": drop.scale,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function NeonSignboard({ sign }: { sign: NeonSign }) {
  return (
    <div
      className="pointer-events-none absolute select-none"
      style={{ ...sign.position, transform: `rotate(${sign.rotation ?? 0}deg)` }}
    >
      <div
        className={`relative rounded-3xl border border-white/10 bg-slate-900/40 px-5 py-3 text-sm uppercase tracking-[0.8em] text-white/80 shadow-[0_0_40px_rgba(244,114,182,0.35)] backdrop-blur-md`}>
        <span
          className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r ${sign.palette} opacity-75 blur-3xl`}
        />
        <span className="relative font-semibold drop-shadow-[0_0_18px_rgba(255,255,255,0.55)]">
          {sign.label}
        </span>
      </div>
    </div>
  );
}

function LensFlareLayer() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {lensFlares.map((flare) => (
        <div
          key={flare.id}
          className={`absolute ${flare.className} rounded-full`}
        >
          <div
            className={`absolute inset-0 animate-lensSweep rounded-full bg-gradient-to-br ${flare.gradient} blur-3xl`}
          />
          <div className={`absolute inset-4 rounded-full border border-white/10 blur-[2px]`} />
        </div>
      ))}
    </div>
  );
}

function NeonCityBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {buildingLayers.map((layer) => (
        <div
          key={layer.id}
          className={`absolute inset-x-[-12%] bottom-0 top-[18%] ${layer.blur} ${layer.opacity} ${layer.translate}`}
        >
          <div
            className={`h-full w-full bg-gradient-to-br ${layer.gradient} [mask-image:linear-gradient(to_top,transparent,rgba(0,0,0,0.45)_18%,rgba(0,0,0,0.9))]`}
          />
        </div>
      ))}
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.3),_rgba(14,116,144,0.08)_45%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(244,114,182,0.25),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.18),transparent_52%)]" />
    </div>
  );
}

function HeroCharacter() {
  return (
    <div className="pointer-events-none absolute bottom-6 left-1/2 flex h-[62%] w-32 -translate-x-1/2 items-end justify-center">
      <div className="absolute inset-0 translate-y-4 rounded-full bg-cyan-300/30 blur-2xl" />
      <div className="relative flex h-full w-full flex-col items-center">
        <div className="relative mt-2 h-12 w-12 rounded-full bg-gradient-to-b from-pink-200 via-fuchsia-200/60 to-purple-400/30 shadow-[0_0_25px_rgba(236,72,153,0.5)]">
          <div className="absolute inset-0 rounded-full border border-white/15" />
          <div className="absolute left-1/2 top-3 h-14 w-10 -translate-x-1/2 rounded-b-[48%] border-x border-white/10" />
        </div>
        <div className="relative -mt-3 h-full w-[72%] origin-bottom animate-strideSlow bg-gradient-to-b from-pink-200/70 via-sky-100/60 to-blue-400/40 shadow-[0_30px_60px_rgba(56,189,248,0.35)] [clip-path:polygon(52%_0%,70%_12%,64%_30%,74%_55%,62%_100%,52%_100%,36%_100%,26%_55%,38%_30%,32%_12%)]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/35 to-transparent opacity-70 mix-blend-screen" />
          <div className="absolute inset-x-[32%] bottom-8 h-24 rounded-full bg-gradient-to-b from-slate-600/30 to-slate-950/60 blur-md" />
          <div className="absolute inset-y-[28%] left-[8%] w-2 rounded-full bg-white/60 blur-md" />
          <div className="absolute inset-y-[36%] right-[6%] w-1.5 rounded-full bg-cyan-200/50 blur-[2px]" />
        </div>
      </div>
    </div>
  );
}

function PavementReflection() {
  return (
    <div className="absolute inset-x-0 bottom-0 h-[38%] overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(circle_at_40%_80%,rgba(244,114,182,0.25),transparent_60%)]" />
      <div className="absolute inset-x-0 bottom-0 h-full bg-[radial-gradient(circle_at_65%_85%,rgba(56,189,248,0.22),transparent_65%)]" />
      <div className="absolute inset-x-[-30%] bottom-0 h-[220%] skew-y-[18deg] bg-[linear-gradient(180deg,rgba(59,130,246,0.15),rgba(236,72,153,0.06),transparent_68%)] opacity-80" />
      <div className="absolute inset-x-0 bottom-2 h-20 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-60 blur-md" />
      <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-cyan-300/60 via-pink-400/80 to-purple-400/70 blur" />
    </div>
  );
}

function DepthOfFieldBokeh() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-24 bottom-12 h-64 w-64 rounded-full bg-pink-400/30 blur-[120px]" />
      <div className="absolute -right-16 top-24 h-72 w-72 rounded-full bg-sky-400/25 blur-[120px]" />
      <div className="absolute left-[12%] top-[42%] h-24 w-24 rounded-full border border-white/25 blur-3xl opacity-70" />
      <div className="absolute right-[16%] top-[48%] h-32 w-32 rounded-full border border-cyan-200/30 blur-2xl opacity-80" />
    </div>
  );
}

function UIOverlays() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute left-6 top-6 flex flex-col gap-3 text-[0.7rem] uppercase tracking-[0.36em] text-white/60">
        <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur-xl">
          Cinematic Sequence // 120fps
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-xl">
          Aperture f/1.4 | ISO 400
        </span>
      </div>
      <div className="absolute right-6 top-6 flex flex-col items-end gap-3 text-[0.65rem] uppercase tracking-[0.42em] text-white/60">
        <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 backdrop-blur-xl">
          Neon District 07
        </span>
        <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur-xl">
          Rainfall + Slow Shutter
        </span>
      </div>
      <div className="absolute inset-x-20 bottom-10 flex items-center gap-3">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-[78%] animate-trackingSweep bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
        </div>
        <span className="text-sm tracking-[0.4em] text-white/70">TAKE 04</span>
      </div>
    </div>
  );
}

export default function Home() {
  const sceneRef = useRef<HTMLDivElement | null>(null);

  useCameraParallax(sceneRef);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_15%,rgba(236,72,153,0.22),transparent_45%),radial-gradient(circle_at_75%_10%,rgba(6,182,212,0.24),transparent_50%),linear-gradient(180deg,rgba(2,6,23,0.85)_10%,rgba(0,0,0,0.92)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(56,189,248,0.06),transparent_55%),linear-gradient(-125deg,rgba(236,72,153,0.08),transparent_60%)]" />

      <main className="relative z-10 w-full max-w-6xl px-4 py-6 sm:px-8 md:px-12 lg:px-16">
        <div className="relative aspect-[2/1] w-full overflow-hidden rounded-[40px] border border-cyan-100/10 bg-slate-950/60 shadow-[0_40px_160px_rgba(14,116,144,0.45)] backdrop-blur-[18px]">
          <div className="absolute inset-[-12%] flex items-center justify-center" ref={sceneRef}>
            <div className="relative h-full w-full scale-105" style={{ transformStyle: "preserve-3d" }}>
              <NeonCityBackdrop />
              <DepthOfFieldBokeh />
              <LensFlareLayer />
              <RainLayer />
              <HeroCharacter />
              <PavementReflection />
              {neonSigns.map((sign) => (
                <NeonSignboard key={sign.id} sign={sign} />
              ))}
              <UIOverlays />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="absolute inset-x-10 bottom-12 flex max-w-lg flex-col gap-6 text-white/90">
            <div className="flex items-center gap-4 text-xs uppercase tracking-[0.5em] text-cyan-200/80">
              <span className="rounded-full border border-cyan-200/30 px-4 py-2 backdrop-blur-xl">Sequence VII</span>
              <span className="rounded-full border border-pink-200/30 px-4 py-2 backdrop-blur-xl">Slow Motion</span>
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-white drop-shadow-[0_12px_32px_rgba(59,130,246,0.45)] sm:text-5xl md:text-6xl">
              Neon Reverie: Midnight Walk
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              A lone protagonist cuts through the neon haze, every droplet suspended in time. Wet pavement mirrors the electric skyline while the lens drifts with deliberate, cinematic grace.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
