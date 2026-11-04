import { useEffect, useMemo, useState } from 'react';
import { Compass, Play, RotateCcw, Sparkles } from 'lucide-react';

interface Props {
  onStart: () => void;
  hasProgress: boolean;
  onReset: () => void;
  solvedCount: number;
  totalZones: number;
}

/** Generates the twinkling stars for the welcome backdrop. */
function useStars(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
      })),
    [count],
  );
}

export default function WelcomeScreen({
  onStart,
  hasProgress,
  onReset,
  solvedCount,
  totalZones,
}: Props) {
  const stars = useStars(60);
  const [mounting, setMounting] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounting(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-sky-950 via-[#15295e] to-[#3a2a5c]">
      {/* Stars */}
      <div className="pointer-events-none absolute inset-0">
        {stars.map((s) => (
          <span
            key={s.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Distant aurora glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-sky-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-[300px] w-[500px] rounded-full bg-fuchsia-500/10 blur-[120px]" />

      {/* Floating math glyphs */}
      {['x', '+', '=', 'y', '²', '÷', 'f', '-', '∑'].map((g, i) => (
        <span
          key={i}
          className="pointer-events-none absolute font-display text-4xl font-bold text-white/10 animate-floatSlow"
          style={{
            left: `${(i * 11 + 5) % 92}%`,
            top: `${(i * 17 + 10) % 80}%`,
            animationDelay: `${i * 0.4}s`,
          }}
        >
          {g}
        </span>
      ))}

      {/* Content */}
      <div
        className={`relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center transition-all duration-700 ${
          mounting ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        <div className="mb-6 flex items-center gap-2 rounded-full border border-gold-500/40 bg-white/5 px-4 py-1.5 text-sm font-semibold text-gold-400 backdrop-blur">
          <Sparkles className="h-4 w-4" />
          Aventura Matemática
        </div>

        <h1 className="font-display text-7xl font-extrabold tracking-tight title-glow sm:text-8xl md:text-9xl">
          ÁLJEBRA
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-sky-100/80">
          Explora un mundo de zonas ocultas, descubre los secretos del álgebra y
          aprende jugando con actividades interactivas.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button
            onClick={onStart}
            className="group relative flex items-center gap-3 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-600 px-8 py-4 text-lg font-bold text-sky-950 shadow-xl shadow-gold-600/30 transition-transform hover:scale-105 active:scale-95"
          >
            <Play className="h-5 w-5 fill-sky-950" />
            {hasProgress ? 'Continuar aventura' : 'Comenzar a explorar'}
            <span className="absolute inset-0 -z-10 rounded-2xl bg-gold-400/50 blur-xl transition-opacity group-hover:opacity-100" />
          </button>

          {hasProgress && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-3.5 font-semibold text-white/80 backdrop-blur transition-colors hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
              Reiniciar progreso
            </button>
          )}
        </div>

        {hasProgress && (
          <div className="mt-8 flex items-center gap-2 rounded-full bg-white/5 px-5 py-2 text-sm font-semibold text-sky-100/70 backdrop-blur">
            <Compass className="h-4 w-4 text-gold-400" />
            {solvedCount} de {totalZones} zonas dominadas
          </div>
        )}

        <p className="mt-12 text-xs text-sky-100/40">
          Tu progreso se guarda automáticamente en este navegador.
        </p>
      </div>
    </div>
  );
}
