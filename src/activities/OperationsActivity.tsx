import { useMemo, useState } from 'react';
import type { ActivityProps } from '@/zones';
import { ActionButton, ChallengeCard, Feedback, HintButton, Prompt } from './ui';

const ACCENT = '#f43f5e';

interface Q {
  a: { coef: number; exp: number };
  b: { coef: number; exp: number };
  op: 'sum' | 'mult';
}

const QUESTIONS: Q[] = [
  { a: { coef: 2, exp: 1 }, b: { coef: 3, exp: 2 }, op: 'mult' },
  { a: { coef: 4, exp: 2 }, b: { coef: 5, exp: 3 }, op: 'mult' },
  { a: { coef: 3, exp: 2 }, b: { coef: 6, exp: 2 }, op: 'sum' },
];

function fmt(c: number, e: number) {
  const sup: Record<number, string> = { 1: '', 2: '²', 3: '³', 4: '⁴' };
  return `${c}x${sup[e] ?? `^${e}`}`;
}

export default function OperationsActivity({ onSolved }: ActivityProps) {
  const [qi, setQi] = useState(0);
  const q = QUESTIONS[qi];
  const [coef, setCoef] = useState('');
  const [exp, setExp] = useState('');
  const [fb, setFb] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const expected = useMemo(() => {
    if (q.op === 'mult') {
      return { coef: q.a.coef * q.b.coef, exp: q.a.exp + q.b.exp };
    }
    // sum of like terms
    return { coef: q.a.coef + q.b.coef, exp: q.a.exp };
  }, [q]);

  const submit = () => {
    const cOk = parseInt(coef, 10) === expected.coef;
    const eOk = parseInt(exp, 10) === expected.exp;
    if (cOk && eOk) {
      if (qi + 1 >= QUESTIONS.length) {
        onSolved();
        setFb('correct');
      } else {
        setFb('correct');
        setTimeout(() => {
          setQi((i) => i + 1);
          setCoef('');
          setExp('');
          setFb('idle');
        }, 1100);
      }
    } else {
      setFb('wrong');
    }
  };

  return (
    <div className="space-y-5">
      <ChallengeCard accent={ACCENT}>
        <div className="mb-2 flex items-center justify-between">
          <Prompt accent={ACCENT}>Calcula el resultado de la operación</Prompt>
          <span className="text-xs font-bold text-sky-100/50">
            Reto {qi + 1} de {QUESTIONS.length}
          </span>
        </div>

        <p className="mb-4 text-sm text-sky-100/70">
          {q.op === 'mult'
            ? `Para multiplicar, multiplica coeficientes y suma exponentes.`
            : `Ambos términos son semejantes. Suma los coeficientes.`}
        </p>

        <div className="flex items-center justify-center gap-3 font-display text-3xl font-bold text-white">
          <span className="rounded-lg bg-white/10 px-4 py-2">{fmt(q.a.coef, q.a.exp)}</span>
          <span>{q.op === 'mult' ? '×' : '+'}</span>
          <span className="rounded-lg bg-white/10 px-4 py-2">{fmt(q.b.coef, q.b.exp)}</span>
          <span>=</span>
          <div className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2">
            <input
              type="number"
              value={coef}
              onChange={(e) => setCoef(e.target.value)}
              className="w-14 bg-transparent text-center text-2xl font-bold text-white outline-none"
              placeholder="n"
            />
            <span>x</span>
            <input
              type="number"
              value={exp}
              onChange={(e) => setExp(e.target.value)}
              className="w-10 bg-transparent text-center text-lg font-bold text-white outline-none"
              placeholder="e"
            />
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-sky-100/50">
          Escribe el coeficiente y el exponente del resultado.
        </p>
      </ChallengeCard>

      <Feedback status={fb}>
        {fb === 'correct'
          ? '¡Muy bien! Operación correcta.'
          : q.op === 'mult'
            ? `Multiplica los coeficientes y suma los exponentes de x.`
            : 'Suma los coeficientes; el exponente se mantiene si son semejantes.'}
      </Feedback>

      <div className="flex items-center justify-between gap-3">
        <HintButton
          accent={ACCENT}
          hint={
            q.op === 'mult'
              ? `Coef: ${q.a.coef} × ${q.b.coef}. Exponente: ${q.a.exp} + ${q.b.exp}.`
              : `Coef: ${q.a.coef} + ${q.b.coef}. Exponente: ${q.a.exp}.`
          }
        />
        <ActionButton accent={ACCENT} onClick={submit} disabled={!coef || !exp}>
          Comprobar
        </ActionButton>
      </div>
    </div>
  );
}
