import { useMemo, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { ZONES, PATHS, type Zone } from '@/zones';

interface Props {
  solvedIds: string[];
  stars: Record<string, number>;
  onSelectZone: (zone: Zone) => void;
  onExit: () => void;
}

const VB_W = 1200;
const VB_H = 700;

/** Decorative mountain ranges as polygons. */
const MOUNTAINS = [
  { pts: '0,420 120,300 240,420', fill: '#1e3a6b' },
  { pts: '900,300 1020,180 1140,300 1200,260 1200,420 900,420', fill: '#1e3a6b' },
];

/** Rivers as smooth curves. */
const RIVERS = [
  { d: 'M 60 460 C 220 420, 360 560, 540 500 S 920 520, 1160 470', stroke: '#3b82f6' },
];

/** Forest tree clusters (x, y, count). */
const FORESTS: { x: number; y: number; n: number; seed: number }[] = [
  { x: 80, y: 520, n: 4, seed: 1 },
  { x: 380, y: 620, n: 5, seed: 2 },
  { x: 700, y: 300, n: 3, seed: 3 },
  { x: 1050, y: 600, n: 4, seed: 4 },
];

function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-3" y="10" width="6" height="14" rx="2" fill="#6b4423" />
      <circle cx="0" cy="2" r="14" fill="#15803d" />
      <circle cx="-8" cy="8" r="10" fill="#16a34a" />
      <circle cx="8" cy="8" r="10" fill="#16a34a" />
    </g>
  );
}

function Cluster({ x, y, n, seed }: { x: number; y: number; n: number; seed: number }) {
  const trees = useMemo(() => {
    let rng = seed * 9973;
    const rand = () => {
      rng = (rng * 1103515245 + 12345) & 0x7fffffff;
      return rng / 0x7fffffff;
    };
    return Array.from({ length: n }, () => ({
      dx: (rand() - 0.5) * 70,
      dy: (rand() - 0.5) * 40,
      s: 0.7 + rand() * 0.5,
    }));
  }, [n, seed]);
  return (
    <g transform={`translate(${x} ${y})`}>
      {trees.map((t, i) => (
        <Tree key={i} x={t.dx} y={t.dy} s={t.s} />
      ))}
    </g>
  );
}

function pathD(a: Zone, b: Zone): string {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - 28;
  return `M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`;
}

export default function WorldMap({ solvedIds, stars, onSelectZone, onExit }: Props) {
  const [hover, setHover] = useState<string | null>(null);

  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#0a1838] via-[#162a5e] to-[#243a73]">
      {/* Top HUD */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 backdrop-blur transition-colors hover:bg-white/10"
          >
            <Lock className="h-4 w-4" /> Menú
          </button>
          <h1 className="font-display text-2xl font-extrabold title-glow sm:text-3xl">
            ÁLJEBRA
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-gold-500/30 bg-white/5 px-4 py-2 text-sm font-bold text-gold-400 backdrop-blur">
          {solvedSet.size} / {ZONES.length} zonas
        </div>
      </header>

      {/* Map surface */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="h-full w-full max-w-[1400px]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="ocean" cx="50%" cy="40%" r="75%">
              <stop offset="0%" stopColor="#2a4a8a" />
              <stop offset="100%" stopColor="#0f234d" />
            </radialGradient>
            <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3f6b3f" />
              <stop offset="100%" stopColor="#274d27" />
            </linearGradient>
            <linearGradient id="island" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a8a4a" />
              <stop offset="100%" stopColor="#365c2e" />
            </linearGradient>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.35" />
            </filter>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ocean backdrop */}
          <rect width={VB_W} height={VB_H} fill="url(#ocean)" />

          {/* Distant mountains */}
          {MOUNTAINS.map((m, i) => (
            <polygon key={i} points={m.pts} fill={m.fill} opacity="0.7" />
          ))}

          {/* Main landmass — an organic blobby island */}
          <path
            d="M 60 300
               C 60 200, 220 160, 360 200
               C 470 230, 560 170, 700 190
               C 840 210, 980 170, 1100 220
               C 1170 250, 1160 360, 1130 440
               C 1100 520, 980 580, 820 590
               C 660 600, 540 560, 400 580
               C 260 600, 120 560, 70 470
               C 40 410, 60 350, 60 300 Z"
            fill="url(#land)"
            filter="url(#soft)"
          />

          {/* Smaller island accents */}
          <ellipse cx="140" cy="470" rx="60" ry="26" fill="url(#island)" opacity="0.85" filter="url(#soft)" />
          <ellipse cx="1130" cy="350" rx="40" ry="22" fill="url(#island)" opacity="0.85" filter="url(#soft)" />

          {/* Rivers */}
          {RIVERS.map((r, i) => (
            <path
              key={i}
              d={r.d}
              stroke={r.stroke}
              strokeWidth="6"
              fill="none"
              opacity="0.6"
              strokeLinecap="round"
            />
          ))}

          {/* Forests */}
          {FORESTS.map((f, i) => (
            <Cluster key={i} x={f.x} y={f.y} n={f.n} seed={f.seed} />
          ))}

          {/* Roads connecting zones */}
          {PATHS.map(([ai, bi], i) => {
            const a = ZONES[ai];
            const b = ZONES[bi];
            return (
              <path
                key={`p-${i}`}
                d={pathD(a, b)}
                fill="none"
                stroke="#caa45a"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="2 14"
                opacity="0.55"
              />
            );
          })}

          {/* Clouds */}
          <g className="cloud animate-cloudDrift" opacity="0.5">
            <ellipse cx="500" cy="80" rx="50" ry="18" fill="#fff" />
            <ellipse cx="540" cy="74" rx="34" ry="14" fill="#fff" />
          </g>
          <g className="cloud animate-cloudDrift" opacity="0.4" style={{ animationDelay: '3s' }}>
            <ellipse cx="900" cy="120" rx="60" ry="20" fill="#fff" />
            <ellipse cx="860" cy="112" rx="30" ry="12" fill="#fff" />
          </g>

          {/* Zone nodes */}
          {ZONES.map((zone) => {
            const solved = solvedSet.has(zone.id);
            const isHover = hover === zone.id;
            const starN = stars[zone.id] ?? 0;
            const Icon = zone.icon;
            return (
              <g
                key={zone.id}
                transform={`translate(${zone.x} ${zone.y})`}
                className="zone-node"
                onMouseEnter={() => setHover(zone.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => onSelectZone(zone)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectZone(zone);
                  }
                }}
              >
                {/* Pulsing aura for unsolved zones */}
                {!solved && (
                  <circle r="30" fill={zone.color} opacity="0.25">
                    <animate
                      attributeName="r"
                      values="26;40;26"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.35;0;0.35"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Shadow disc */}
                <ellipse cx="0" cy="22" rx="22" ry="6" fill="#000" opacity="0.25" />

                <g className="zone-node-body">
                <g className="animate-floatY" style={{ animationDelay: `${(zone.x % 5) * 0.3}s` }}>
                  <circle
                    r="26"
                    fill={zone.color}
                    stroke="#fff"
                    strokeWidth={isHover ? 4 : 2.5}
                    filter="url(#glow)"
                  />
                  <circle r="26" fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
                  <foreignObject x="-16" y="-16" width="32" height="32">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32 }}>
                      <Icon size={20} color="#0a1838" strokeWidth={2.5} />
                    </div>
                  </foreignObject>

                  {solved && (
                    <g transform="translate(18 -18)">
                      <circle r="11" fill="#22c55e" stroke="#fff" strokeWidth="2" />
                      <foreignObject x="-9" y="-9" width="18" height="18">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18 }}>
                          <Check size={12} color="#fff" strokeWidth={3.5} />
                        </div>
                      </foreignObject>
                    </g>
                  )}
                </g>
                </g>

                {/* Label */}
                <g transform="translate(0 46)" style={{ pointerEvents: 'none' }}>
                  <rect
                    x="-58"
                    y="-12"
                    width="116"
                    height="34"
                    rx="10"
                    fill="#0a1838"
                    opacity={isHover ? 0.95 : 0.7}
                    style={{ transition: 'opacity 0.2s' }}
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#fff"
                    fontSize="12"
                    fontWeight="700"
                    fontFamily="Baloo 2, sans-serif"
                  >
                    {zone.title}
                  </text>
                  {starN > 0 && (
                    <text
                      x="0"
                      y="17"
                      textAnchor="middle"
                      fill={zone.color}
                      fontSize="9"
                      fontWeight="700"
                    >
                      {'★'.repeat(Math.min(starN, 3))}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover tagline banner */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 px-4">
        {hover ? (
          <div className="animate-popIn rounded-2xl border border-white/15 bg-sky-950/80 px-5 py-3 text-center backdrop-blur">
            <p className="font-display text-base font-bold text-white">
              {ZONES.find((z) => z.id === hover)?.title}
            </p>
            <p className="text-sm text-sky-100/70">
              {ZONES.find((z) => z.id === hover)?.tagline}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-sky-950/60 px-5 py-3 text-center text-sm text-sky-100/60 backdrop-blur">
            Toca una zona del mapa para comenzar una actividad
          </div>
        )}
      </div>
    </div>
  );
}
