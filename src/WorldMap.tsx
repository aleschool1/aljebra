import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Check, Lock, Plus, Minus } from 'lucide-react';
import { ZONES, PATHS, type Zone } from '@/zones';

interface Props {
  solvedIds: string[];
  stars: Record<string, number>;
  onSelectZone: (zone: Zone) => void;
  onExit: () => void;
}

const VB_W = 1200;
const VB_H = 700;
const MAX_ZOOM = 4; // max zoom-in factor from the "fit" view

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

/** viewBox state — a window into the 1200×700 map coordinate space. */
interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const FULL_VB: ViewBox = { x: 0, y: 0, w: VB_W, h: VB_H };

/** Compute the viewBox that fits the container, filling it entirely with the map. */
function computeFitVB(cw: number, ch: number): ViewBox {
  const aspect = cw / ch;
  const mapAspect = VB_W / VB_H;
  let w: number, h: number;
  if (aspect > mapAspect) {
    w = VB_W;
    h = VB_W / aspect;
  } else {
    h = VB_H;
    w = VB_H * aspect;
  }
  return { x: (VB_W - w) / 2, y: (VB_H - h) / 2, w, h };
}

/** Clamp the viewBox so it stays within the map bounds and zoom limits. */
function clampVB(vb: ViewBox, fitW: number): ViewBox {
  const aspect = vb.h / vb.w;
  let w = Math.max(fitW / MAX_ZOOM, Math.min(VB_W, vb.w));
  let h = w * aspect;
  // if h exceeds map height, scale down to fit
  if (h > VB_H) {
    h = VB_H;
    w = h / aspect;
  }
  let x = vb.x;
  let y = vb.y;
  if (w >= VB_W) x = (VB_W - w) / 2;
  else x = Math.max(0, Math.min(VB_W - w, x));
  if (h >= VB_H) y = (VB_H - h) / 2;
  else y = Math.max(0, Math.min(VB_H - h, y));
  return { x, y, w, h };
}

interface PointerInfo {
  id: number;
  x: number;
  y: number;
}

export default function WorldMap({ solvedIds, stars, onSelectZone, onExit }: Props) {
  const [hover, setHover] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState<ViewBox>(FULL_VB);
  const [isPanning, setIsPanning] = useState(false);

  const solvedSet = useMemo(() => new Set(solvedIds), [solvedIds]);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Track the "fit" width so clampVB knows the zoom-out limit.
  const fitWRef = useRef(VB_W);

  // Measure container on mount + resize, set initial viewBox.
  useLayoutEffect(() => {
    const measure = () => {
      const c = containerRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const fit = computeFitVB(rect.width, rect.height);
      fitWRef.current = fit.w;
      setViewBox(fit);
    };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('orientationchange', () => setTimeout(measure, 200));
    return () => {
      window.removeEventListener('resize', measure);
    };
  }, []);

  // Keep latest viewBox in a ref for gesture handlers
  const vbRef = useRef(viewBox);
  vbRef.current = viewBox;

  // Gesture state
  const pointers = useRef<Map<number, PointerInfo>>(new Map());
  const pinchStart = useRef<{ dist: number; vb: ViewBox; cx: number; cy: number } | null>(null);
  const panStart = useRef<{ x: number; y: number; vb: ViewBox } | null>(null);

  /** Zoom by a factor around a screen point (relative to container). */
  const zoomAround = useCallback(
    (factor: number, px: number, py: number, current: ViewBox): ViewBox => {
      const c = containerRef.current;
      if (!c) return current;
      const rect = c.getBoundingClientRect();
      // Convert screen point to map coordinates
      const mapX = current.x + (px / rect.width) * current.w;
      const mapY = current.y + (py / rect.height) * current.h;
      const newW = current.w / factor;
      const newH = current.h / factor;
      const newX = mapX - (px / rect.width) * newW;
      const newY = mapY - (py / rect.height) * newH;
      return clampVB({ x: newX, y: newY, w: newW, h: newH }, fitWRef.current);
    },
    [],
  );

  // Wheel zoom (desktop) — attached as non-passive via useEffect
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const c = containerRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const delta = -e.deltaY * 0.0015;
      setViewBox((vb) => zoomAround(1 + delta, px, py, vb));
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [zoomAround]);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2) {
      // Start pinch
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const c = containerRef.current;
      const rect = c!.getBoundingClientRect();
      pinchStart.current = {
        dist,
        vb: vbRef.current,
        cx: (pts[0].x + pts[1].x) / 2 - rect.left,
        cy: (pts[0].y + pts[1].y) / 2 - rect.top,
      };
      panStart.current = null;
      setIsPanning(false);
    } else if (pointers.current.size === 1) {
      panStart.current = { x: e.clientX, y: e.clientY, vb: vbRef.current };
      setIsPanning(false);
    }
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { id: e.pointerId, x: e.clientX, y: e.clientY });
    const c = containerRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();

    if (pointers.current.size === 2 && pinchStart.current) {
      const ps = pinchStart.current;
      const pts = [...pointers.current.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const factor = dist / ps.dist;
      setViewBox(zoomAround(factor, ps.cx, ps.cy, ps.vb));
    } else if (pointers.current.size === 1 && panStart.current) {
      const ps = panStart.current;
      const dxPx = e.clientX - ps.x;
      const dyPx = e.clientY - ps.y;
      if (Math.abs(dxPx) > 3 || Math.abs(dyPx) > 3) setIsPanning(true);
      // Convert pixel delta to viewBox units
      const dxVB = (dxPx / rect.width) * ps.vb.w;
      const dyVB = (dyPx / rect.height) * ps.vb.h;
      setViewBox(
        clampVB(
          { x: ps.vb.x - dxVB, y: ps.vb.y - dyVB, w: ps.vb.w, h: ps.vb.h },
          fitWRef.current,
        ),
      );
    }
  };

  const endPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
    if (pointers.current.size === 0) {
      panStart.current = null;
      setIsPanning(false);
    } else if (pointers.current.size === 1) {
      const pt = [...pointers.current.values()][0];
      panStart.current = { x: pt.x, y: pt.y, vb: vbRef.current };
    }
  };

  const zoomBy = (factor: number) => {
    const c = containerRef.current;
    if (!c) return;
    const rect = c.getBoundingClientRect();
    setViewBox((vb) => zoomAround(factor, rect.width / 2, rect.height / 2, vb));
  };

  const vbStr = `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-[#0a1838] via-[#162a5e] to-[#243a73]">
      {/* Top HUD */}
      <header className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white/80 backdrop-blur transition-colors hover:bg-white/10 sm:px-3 sm:py-2 sm:text-sm"
          >
            <Lock className="h-4 w-4" /> <span className="hidden sm:inline">Menú</span>
          </button>
          <h1 className="font-display text-xl font-extrabold title-glow sm:text-3xl">
            ÁLJEBRA
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-gold-500/30 bg-white/5 px-3 py-1.5 text-xs font-bold text-gold-400 backdrop-blur sm:px-4 sm:py-2 sm:text-sm">
          {solvedSet.size} / {ZONES.length} zonas
        </div>
      </header>

      {/* Map surface */}
      <div ref={containerRef} className="absolute inset-0 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={vbStr}
          className="h-full w-full select-none"
          preserveAspectRatio="xMidYMid meet"
          style={{
            cursor: isPanning ? 'grabbing' : 'grab',
            touchAction: 'none',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
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

          {/* Main landmass */}
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
                {!solved && (
                  <circle r="30" fill={zone.color} opacity="0.25">
                    <animate attributeName="r" values="26;40;26" dur="2.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0;0.35" dur="2.4s" repeatCount="indefinite" />
                  </circle>
                )}

                <ellipse cx="0" cy="22" rx="22" ry="6" fill="#000" opacity="0.25" />

                <g
                  className="zone-node-body animate-floatY"
                  style={{
                    animationDelay: `${(zone.x % 5) * 0.3}s`,
                    transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: isHover ? 'scale(1.12)' : 'scale(1)',
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                  }}
                >
                  <circle r="26" fill={zone.color} stroke="#fff" strokeWidth={isHover ? 4 : 2.5} filter="url(#glow)" />
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
                  <text x="0" y="4" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" fontFamily="Baloo 2, sans-serif">
                    {zone.title}
                  </text>
                  {starN > 0 && (
                    <text x="0" y="17" textAnchor="middle" fill={zone.color} fontSize="9" fontWeight="700">
                      {'★'.repeat(Math.min(starN, 3))}
                    </text>
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-20 right-3 z-20 flex flex-col gap-2 sm:bottom-6 sm:right-5">
        <button
          onClick={() => zoomBy(1.3)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-sky-950/80 text-white backdrop-blur transition-colors hover:bg-sky-800/80 active:scale-90"
          aria-label="Acercar"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          onClick={() => zoomBy(1 / 1.3)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-sky-950/80 text-white backdrop-blur transition-colors hover:bg-sky-800/80 active:scale-90"
          aria-label="Alejar"
        >
          <Minus className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile hint */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 px-4 sm:hidden">
        <div className="rounded-full border border-white/10 bg-sky-950/70 px-4 py-2 text-center text-xs text-sky-100/60 backdrop-blur">
          Arrastra para explorar · pellizca para acercar
        </div>
      </div>

      {/* Desktop hover tagline */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 px-4 sm:block">
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
