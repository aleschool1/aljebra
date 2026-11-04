import { useState } from 'react';
import type { ActivityProps } from '@/zones';
import { ActionButton, ChallengeCard, Feedback, HintButton, Prompt } from './ui';

const ACCENT = '#a855f7';

interface Q {
  rule: string;
  inputs: number[];
  outputs: number[];
}

const QUESTIONS: Q[] = [
  { rule: 'f(x) = 2x + 1', inputs: [1, 2, 3], outputs: [3, 5, 7] },
  { rule: 'f(x) = x²', inputs: [2, 3, 4], outputs: [4, 9, 16] },
  { rule: 'f(x) = 3x - 2', inputs: [0, 1, 5], outputs: [-2, 1, 13] },
];

export default function FunctionsActivity({ onSolved }: ActivityProps) {
  const [qi, setQi] = useState(0);
  const [ii, setIi] = useState(0);
  const [ans, setAns] = useState('');
  const [fb, setFb] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const q = QUESTIONS[qi];
  const input = q.inputs[ii];
  const expected = q.outputs[ii];

  const check = () => {
    if (parseInt(ans, 10) === expected) {
      if (ii + 1 < q.inputs.length) {
        setFb('correct');
        setTimeout(() => {
          setIi((i) => i + 1);
          setAns('');
          setFb('idle');
        }, 1000);
      } else if (qi + 1 < QUESTIONS.length) {
        setFb('correct');
        setTimeout(() => {
          setQi((i) => i + 1);
          setIi(0);
          setAns('');
          setFb('idle');
        }, 1200);
      } else {
        onSolved();
        setFb('correct');
      }
    } else {
      setFb('wrong');
    }
  };

  return (
    <div className="space-y-5">
      <ChallengeCard accent={ACCENT}>
        <div className="mb-2 flex items-center justify-between">
          <Prompt accent={ACCENT}>Calcula la salida de la función</Prompt>
          <span className="text-xs font-bold text-sky-100/50">
            Función {qi + 1} · Entrada {ii + 1}
          </span>
        </div>

        <p className="mb-4 text-sm text-sky-100/70">
          Una función es una máquina: entra un número y sale otro siguiendo una regla.
          Sustituye x por la entrada y opera.
        </p>

        {/* Function machine visual */}
        <div className="mb-5 flex items-center justify-center gap-3">
          <div className="rounded-xl bg-white/10 px-5 py-3 text-center">
            <p className="text-xs text-sky-100/60">Entrada</p>
            <p className="font-display text-3xl font-bold text-white">{input}</p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="rounded-xl px-5 py-3 font-display text-lg font-bold text-sky-950"
              style={{ background: ACCENT }}
            >
              {q.rule}
            </div>
            <span className="mt-1 text-xl text-sky-100/40">→</span>
          </div>
          <div className="rounded-xl border-2 border-dashed border-white/20 px-5 py-3 text-center">
            <p className="text-xs text-sky-100/60">Salida</p>
            <input
              type="number"
              value={ans}
              onChange={(e) => setAns(e.target.value)}
              className="w-20 bg-transparent text-center font-display text-3xl font-bold text-white outline-none"
              placeholder="?"
            />
          </div>
        </div>
      </ChallengeCard>

      <Feedback status={fb}>
        {fb === 'correct'
          ? '¡Correcto! Esa es la salida.'
          : `Sustituye x por ${input} en ${q.rule} y opera con cuidado.`}
      </Feedback>

      <div className="flex items-center justify-between gap-3">
        <HintButton
          accent={ACCENT}
          hint={`Reemplaza x por ${input}: ${q.rule.replace('f(x) = ', '').replace(/x²/g, `(${input})²`).replace(/x/g, String(input))}, y calcula.`}
        />
        <ActionButton accent={ACCENT} onClick={check} disabled={!ans}>
          Comprobar
        </ActionButton>
      </div>
    </div>
  );
}
