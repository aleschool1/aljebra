import { useState } from 'react';
import type { ActivityProps } from '@/zones';
import { ActionButton, ChallengeCard, Feedback, HintButton, Prompt } from './ui';

const ACCENT = '#0ea5e9';

/**
 * Intro: a gentle "open the chests" activity. The student matches a word
 * description to its algebraic symbol, reinforcing the idea that letters
 * represent numbers.
 */
const ITEMS: { word: string; symbol: string }[] = [
  { word: 'Un número cualquiera', symbol: 'x' },
  { word: 'El doble de un número', symbol: '2x' },
  { word: 'La suma de dos números', symbol: 'x + y' },
  { word: 'Un número al cuadrado', symbol: 'x²' },
];

const SYMBOLS = ['x', '2x', 'x + y', 'x²'];

export default function IntroActivity({ onSolved }: ActivityProps) {
  const [matches, setMatches] = useState<Record<string, string | null>>({});
  const [checked, setChecked] = useState(false);

  const allMatched = ITEMS.every((it) => matches[it.word]);

  const check = () => {
    const ok = ITEMS.every((it) => matches[it.word] === it.symbol);
    if (ok) {
      onSolved();
    } else {
      setChecked(true);
    }
  };

  return (
    <div className="space-y-5">
      <ChallengeCard accent={ACCENT}>
        <Prompt accent={ACCENT}>Une cada idea con su símbolo algebraico</Prompt>
        <p className="mb-4 text-sm text-sky-100/70">
          El álgebra usa letras para representar números. Arrastra mentalmente cada
          frase con el símbolo que le corresponde.
        </p>

        <div className="space-y-3">
          {ITEMS.map((it) => (
            <div key={it.word} className="flex flex-wrap items-center gap-3">
              <span className="w-56 rounded-lg bg-white/5 px-3 py-2 text-sm text-sky-100/90">
                {it.word}
              </span>
              <span className="text-sky-100/40">→</span>
              <div className="flex flex-wrap gap-2">
                {SYMBOLS.map((s) => {
                  const chosen = matches[it.word] === s;
                  return (
                    <button
                      key={s}
                      onClick={() =>
                        setMatches((m) => ({ ...m, [it.word]: chosen ? null : s }))
                      }
                      className={`rounded-lg px-3 py-1.5 font-display text-lg font-bold transition-all ${
                        chosen ? 'ring-2 ring-white' : 'ring-1 ring-white/15'
                      }`}
                      style={{
                        background: chosen ? `${ACCENT}40` : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                      }}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ChallengeCard>

      <Feedback status={checked ? 'wrong' : 'idle'}>
        Algunas uniones no son correctas. Revisa: ¿qué letra representa "un número"?
      </Feedback>

      <div className="flex items-center justify-between gap-3">
        <HintButton
          accent={ACCENT}
          hint="Las letras (x, y) representan números. El 'doble' multiplica por 2, 'al cuadrado' eleva a 2."
        />
        <ActionButton accent={ACCENT} onClick={check} disabled={!allMatched}>
          Comprobar
        </ActionButton>
      </div>
    </div>
  );
}
