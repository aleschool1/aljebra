import type { ReactNode } from 'react';
import { Lightbulb, Check, X } from 'lucide-react';

/** Card that wraps a single challenge inside an activity. */
export function ChallengeCard({
  children,
  accent,
}: {
  children: ReactNode;
  accent: string;
}) {
  return (
    <div
      className="rounded-2xl border-2 bg-white/5 p-5 backdrop-blur"
      style={{ borderColor: `${accent}55` }}
    >
      {children}
    </div>
  );
}

/** Prompt header for a challenge. */
export function Prompt({
  children,
  accent,
}: {
  children: ReactNode;
  accent: string;
}) {
  return (
    <p className="mb-4 font-display text-lg font-bold text-white">
      <span className="mr-2 inline-block rounded-md px-2 py-0.5 text-sm" style={{ background: `${accent}33`, color: accent }}>
        Reto
      </span>
      {children}
    </p>
  );
}

/** Feedback banner shown after checking an answer. */
export function Feedback({
  status,
  children,
}: {
  status: 'correct' | 'wrong' | 'idle';
  children: ReactNode;
}) {
  if (status === 'idle') return <div className="min-h-[44px]" />;
  const correct = status === 'correct';
  return (
    <div
      className={`flex items-start gap-2 rounded-xl p-3 text-sm font-semibold animate-popIn ${
        correct ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
      }`}
    >
      {correct ? <Check className="mt-0.5 h-5 w-5 shrink-0" /> : <X className="mt-0.5 h-5 w-5 shrink-0" />}
      <span>{children}</span>
    </div>
  );
}

/** Button to reveal the hint for the current challenge. */
export function HintButton({
  hint,
  accent,
}: {
  hint: string;
  accent: string;
}) {
  return (
    <details className="group">
      <summary
        className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
        style={{ color: accent, background: `${accent}1a` }}
      >
        <Lightbulb className="h-4 w-4" />
        Pedir pista
      </summary>
      <p className="mt-2 rounded-lg bg-white/5 p-3 text-sm text-sky-100/80">
        {hint}
      </p>
    </details>
  );
}

/** Primary action button used inside activities. */
export function ActionButton({
  onClick,
  children,
  accent,
  disabled,
}: {
  onClick: () => void;
  children: ReactNode;
  accent: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl px-5 py-2.5 font-bold text-sky-950 transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: accent }}
    >
      {children}
    </button>
  );
}

/** Math expression styled like a token chip. */
export function MathChip({
  children,
  color = '#fff',
  bg = 'rgba(255,255,255,0.1)',
  onClick,
  selected,
}: {
  children: ReactNode;
  color?: string;
  bg?: string;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 font-display text-lg font-bold transition-all ${
        onClick ? 'cursor-pointer hover:scale-105' : 'cursor-default'
      } ${selected ? 'ring-2 ring-white' : ''}`}
      style={{ color, background: bg }}
    >
      {children}
    </button>
  );
}
