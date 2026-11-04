import { useState } from 'react';
import { ArrowLeft, BookOpen, Dices, GraduationCap, PartyPopper, Star, X } from 'lucide-react';
import type { Zone, ActivityProps } from '@/zones';

interface Props {
  zone: Zone;
  solved: boolean;
  onSolved: (zoneId: string, starCount: number) => void;
  onClose: () => void;
}

type Tab = 'learn' | 'play';

export default function ActivityModal({ zone, solved, onSolved, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('learn');
  const [justSolved, setJustSolved] = useState(false);
  const [playKey, setPlayKey] = useState(0);

  const Activity = zone.activity;
  const accent = zone.accent;

  const handleSolved: ActivityProps['onSolved'] = () => {
    onSolved(zone.id, 3);
    setJustSolved(true);
  };

  const replay = () => {
    setJustSolved(false);
    setPlayKey((k) => k + 1);
  };

  const Icon = zone.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-sky-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border bg-gradient-to-b from-[#13265a] to-[#0c1b40] shadow-2xl animate-popIn"
        style={{ borderColor: `${accent}66` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: `linear-gradient(90deg, ${accent}33, transparent)` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: accent }}
            >
              <Icon className="h-6 w-6 text-sky-950" />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-white">{zone.title}</h2>
              <p className="text-sm text-sky-100/60">{zone.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 pt-3">
          <TabButton active={tab === 'learn'} onClick={() => setTab('learn')} accent={accent}>
            <BookOpen className="h-4 w-4" /> Aprende
          </TabButton>
          <TabButton active={tab === 'play'} onClick={() => setTab('play')} accent={accent}>
            <Dices className="h-4 w-4" /> Practica
          </TabButton>
          {solved && (
            <div className="ml-auto flex items-center gap-1 self-center rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-bold text-emerald-300">
              <Star className="h-3.5 w-3.5 fill-emerald-300" />
              Completado
            </div>
          )}
        </div>

        {/* Body */}
        <div className="game-scroll flex-1 overflow-y-auto px-5 py-4">
          {tab === 'learn' ? (
            <div className="animate-slideUp space-y-4">
              <section>
                <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-white">
                  <GraduationCap className="h-5 w-5" style={{ color: accent }} />
                  Explicación
                </h3>
                <p className="leading-relaxed text-sky-100/85">{zone.content.explanation}</p>
              </section>

              <section>
                <h3 className="mb-2 font-display text-base font-bold text-white">Ejemplos resueltos</h3>
                <div className="space-y-3">
                  {zone.content.examples.map((ex, i) => (
                    <div key={i} className="rounded-xl bg-white/5 p-4">
                      <p className="mb-2 font-display font-bold" style={{ color: accent }}>
                        {ex.statement}
                      </p>
                      <ol className="space-y-1.5">
                        {ex.steps.map((s, j) => (
                          <li key={j} className="flex gap-2 text-sm text-sky-100/80">
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                              style={{ background: `${accent}33`, color: accent }}
                            >
                              {j + 1}
                            </span>
                            {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </section>

              <button
                onClick={() => setTab('play')}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-sky-950 transition-transform hover:scale-[1.02]"
                style={{ background: accent }}
              >
                <Dices className="h-5 w-5" /> ¡Pasar a practicar!
              </button>
            </div>
          ) : (
            <div className="animate-slideUp">
              {/* Solved celebration overlay */}
              {justSolved ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center animate-popIn">
                  <PartyPopper className="h-16 w-16 animate-floatY" style={{ color: accent }} />
                  <h3 className="font-display text-2xl font-extrabold text-white">¡Zona conquistada!</h3>
                  <p className="max-w-sm text-sky-100/80">
                    Has dominado <strong style={{ color: accent }}>{zone.title}</strong>. Tu progreso
                    se ha guardado en el mapa.
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <Star
                        key={i}
                        className="h-7 w-7 fill-gold-400 text-gold-400 animate-badgePop"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={replay}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-white/10"
                    >
                      <Dices className="h-4 w-4" /> Repetir actividad
                    </button>
                    <button
                      onClick={onClose}
                      className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-sky-950 transition-transform hover:scale-105"
                      style={{ background: accent }}
                    >
                      <ArrowLeft className="h-4 w-4" /> Volver al mapa
                    </button>
                  </div>
                </div>
              ) : (
                <Activity key={playKey} onSolved={handleSolved} solved={solved} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  accent,
  children,
}: {
  active: boolean;
  onClick: () => void;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold transition-all"
      style={
        active
          ? { background: accent, color: '#0a1838' }
          : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }
      }
    >
      {children}
    </button>
  );
}
