import { useMemo, useState } from 'react';
import type { ActivityProps } from '@/zones';
import { ActionButton, ChallengeCard, Feedback, HintButton, Prompt } from './ui';

const ACCENT = '#10b981';

interface Q {
  expr: string;
  terms: number;
  variables: string[];
}

const QUESTIONS: Q[] = [
  { expr: '4x² + 2x - 7', terms: 3, variables: ['x'] },
  { expr: '3a + 5b - 2a + 8', terms: 4, variables: ['a', 'b'] },
  { expr: '6m²n - mn + 9', terms: 3, variables: ['m', 'n'] },
];

export default function ExpressionsActivity({ onSolved }: ActivityProps) {
  const [qi, setQi] = useState(0);
  const q = QUESTIONS[qi];
  const [termAns, setTermAns] = useState('');
  const [varAns, setVarAns] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const solvedAll = qi >= QUESTIONS.length;

  const submit = () => {
    const termsOk = parseInt(termAns, 10) === q.terms;
    const varsOk =
      varAns.length === q.variables.length &&
      q.variables.every((v) => varAns.includes(v));
    if (termsOk && varsOk) {
      if (qi + 1 >= QUESTIONS.length) {
        onSolved();
        setFeedback('correct');
      } else {
        setFeedback('correct');
        setTimeout(() => {
          setQi((i) => i + 1);
          setTermAns('');
          setVarAns([]);
          setFeedback('idle');
        }, 1100);
      }
    } else {
      setFeedback('wrong');
    }
  };

  const varBank = useMemo(() => {
    const all = ['x', 'y', 'a', 'b', 'm', 'n'];
    return Array.from(new Set([...all, ...q.variables])).sort();
  }, [q]);

  if (solvedAll) {
    return (
      <div className="py-8 text-center">
        <p className="font-display text-xl font-bold text-white">¡Expresiones dominadas!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ChallengeCard accent={ACCENT}>
        <div className="mb-2 flex items-center justify-between">
          <Prompt accent={ACCENT}>Analiza la expresión</Prompt>
          <span className="text-xs font-bold text-sky-100/50">
            Reto {qi + 1} de {QUESTIONS.length}
          </span>
        </div>

        <div className="mb-5 rounded-xl bg-white/5 py-4 text-center font-display text-3xl font-bold text-white">
          {q.expr}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-sky-100/80">
              ¿Cuántos términos tiene?
            </label>
            <input
              type="number"
              value={termAns}
              onChange={(e) => setTermAns(e.target.value)}
              className="w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-lg font-bold text-white outline-none focus:border-emerald-400"
              placeholder="?"
            />
          </div>

          <div>
            <p className="mb-1.5 text-sm font-semibold text-sky-100/80">
              ¿Qué variables aparecen? (toca para seleccionar)
            </p>
            <div className="flex flex-wrap gap-2">
              {varBank.map((v) => {
                const on = varAns.includes(v);
                return (
                  <button
                    key={v}
                    onClick={() =>
                      setVarAns((a) => (on ? a.filter((x) => x !== v) : [...a, v]))
                    }
                    className="rounded-lg px-4 py-2 font-display text-xl font-bold transition-all"
                    style={{
                      background: on ? `${ACCENT}50` : 'rgba(255,255,255,0.05)',
                      color: '#fff',
                      outline: on ? `2px solid ${ACCENT}` : 'none',
                    }}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </ChallengeCard>

      <Feedback status={feedback}>
        {feedback === 'correct'
          ? qi + 1 >= QUESTIONS.length
            ? '¡Perfecto! Has analizado todas las expresiones.'
            : '¡Correcto! Siguiente expresión...'
          : 'Cuenta los términos separados por + o -. Las variables son las letras que aparecen.'}
      </Feedback>

      <div className="flex items-center justify-between gap-3">
        <HintButton accent={ACCENT} hint="Cada término está separado por + o -. Las variables son las letras; ignora los números." />
        <ActionButton accent={ACCENT} onClick={submit} disabled={!termAns}>
          Comprobar
        </ActionButton>
      </div>
    </div>
  );
}
