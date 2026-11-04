import { useMemo, useState } from 'react';
import type { ActivityProps } from '@/zones';
import { ActionButton, ChallengeCard, Feedback, HintButton, Prompt } from './ui';

const ACCENT = '#ec4899';

interface Item {
  phrase: string;
  expr: string;
}

const BANK: Item[] = [
  { phrase: 'El doble de un número', expr: '2x' },
  { phrase: 'Un número más cuatro', expr: 'x + 4' },
  { phrase: 'La mitad de un número', expr: 'x ÷ 2' },
  { phrase: 'El triple de un número menos uno', expr: '3x - 1' },
  { phrase: 'El cuadrado de un número', expr: 'x²' },
  { phrase: 'La suma de dos números distintos', expr: 'x + y' },
];

export default function LanguageActivity({ onSolved }: ActivityProps) {
  const { items, options } = useMemo(() => {
    const shuffled = [...BANK].sort(() => Math.random() - 0.5).slice(0, 4);
    const opts = shuffled
      .map((s) => s.expr)
      .sort(() => Math.random() - 0.5);
    return { items: shuffled, options: opts };
  }, []);

  const [picked, setPicked] = useState<string[]>([]);
  const [assign, setAssign] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const pick = (expr: string) => {
    if (picked.includes(expr)) return;
    setPicked((p) => [...p, expr]);
  };

  const chooseFor = (phrase: string, expr: string) => {
    setAssign((a) => {
      const next = { ...a };
      // free up the expr from any previous assignment
      Object.keys(next).forEach((k) => {
        if (next[k] === expr) delete next[k];
      });
      next[phrase] = expr;
      return next;
    });
  };

  const allAssigned = items.every((it) => assign[it.phrase]);
  const check = () => {
    const ok = items.every((it) => assign[it.phrase] === it.expr);
    if (ok) onSolved();
    else setChecked(true);
  };

  return (
    <div className="space-y-5">
      <ChallengeCard accent={ACCENT}>
        <Prompt accent={ACCENT}>Traduce cada frase al lenguaje algebraico</Prompt>

        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.phrase} className="flex flex-wrap items-center gap-3">
              <span className="w-64 rounded-lg bg-white/5 px-3 py-2 text-sm text-sky-100/90">
                "{it.phrase}"
              </span>
              <span className="text-sky-100/40">→</span>
              <span
                className="rounded-lg px-4 py-2 font-display text-lg font-bold"
                style={{
                  background: assign[it.phrase] ? `${ACCENT}40` : 'rgba(255,255,255,0.05)',
                  color: '#fff',
                }}
              >
                {assign[it.phrase] ?? '...'}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-sky-100/70">Expresiones disponibles (toca y luego asigna a una frase):</p>
          <div className="flex flex-wrap gap-2">
            {picked.map((e) => {
              const used = Object.values(assign).includes(e);
              return (
                <button
                  key={e}
                  onClick={() => {
                    // Assign to first unassigned phrase
                    const target = items.find((it) => !assign[it.phrase]);
                    if (target) chooseFor(target.phrase, e);
                  }}
                  disabled={used}
                  className={`rounded-lg px-3 py-1.5 font-display text-lg font-bold transition-all ${
                    used ? 'opacity-30' : 'hover:scale-105'
                  }`}
                  style={{ background: `${ACCENT}30`, color: '#fff' }}
                >
                  {e}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {options.map((e) => (
              <button
                key={e}
                onClick={() => pick(e)}
                disabled={picked.includes(e)}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-display font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-30"
              >
                + {e}
              </button>
            ))}
          </div>
        </div>
      </ChallengeCard>

      <Feedback status={checked ? 'wrong' : 'idle'}>
        Revisa las palabras clave: doble (2x), triple (3x), mitad (÷2), cuadrado (²).
      </Feedback>

      <div className="flex items-center justify-between gap-3">
        <HintButton accent={ACCENT} hint="Doble = multiplicar por 2. Triple = por 3. Mitad = dividir entre 2. 'Más' = suma. 'Menos' = resta." />
        <ActionButton accent={ACCENT} onClick={check} disabled={!allAssigned}>
          Comprobar
        </ActionButton>
      </div>
    </div>
  );
}
