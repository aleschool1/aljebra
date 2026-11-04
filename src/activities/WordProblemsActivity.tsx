import { useState } from 'react';
import type { ActivityProps } from '@/zones';
import { ActionButton, ChallengeCard, Feedback, HintButton, Prompt } from './ui';

const ACCENT = '#14b8a6';

interface Q {
  story: string;
  equation: string;
  answer: number;
}

const QUESTIONS: Q[] = [
  {
    story:
      'Piensa un número. Si le sumas su doble, el resultado es 12. ¿Cuál es el número?',
    equation: 'x + 2x = 12',
    answer: 4,
  },
  {
    story:
      'La edad de Ana es el doble que la de su hermano. Entre los dos suman 18 años. ¿Cuántos años tiene el hermano?',
    equation: 'x + 2x = 18',
    answer: 6,
  },
];

export default function WordProblemsActivity({ onSolved }: ActivityProps) {
  const [qi, setQi] = useState(0);
  const [stage, setStage] = useState<'equation' | 'value'>('equation');
  const [eqPicked, setEqPicked] = useState<string | null>(null);
  const [val, setVal] = useState('');
  const [fb, setFb] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const q = QUESTIONS[qi];

  const eqOptions = [q.equation, '2x = 12', 'x - 2x = 12', 'x² = 12'];

  const pickEq = (eq: string) => {
    setEqPicked(eq);
    if (eq === q.equation) {
      setFb('correct');
      setTimeout(() => {
        setStage('value');
        setFb('idle');
      }, 1100);
    } else {
      setFb('wrong');
    }
  };

  const checkVal = () => {
    if (parseInt(val, 10) === q.answer) {
      if (qi + 1 >= QUESTIONS.length) {
        onSolved();
        setFb('correct');
      } else {
        setFb('correct');
        setTimeout(() => {
          setQi((i) => i + 1);
          setStage('equation');
          setEqPicked(null);
          setVal('');
          setFb('idle');
        }, 1300);
      }
    } else {
      setFb('wrong');
    }
  };

  return (
    <div className="space-y-5">
      <ChallengeCard accent={ACCENT}>
        <div className="mb-2 flex items-center justify-between">
          <Prompt accent={ACCENT}>Resuelve el problema</Prompt>
          <span className="text-xs font-bold text-sky-100/50">
            Problema {qi + 1} de {QUESTIONS.length}
          </span>
        </div>

        <div className="mb-4 rounded-xl bg-white/5 p-4 text-sky-100/90">
          <span className="mr-2 rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: `${ACCENT}33`, color: ACCENT }}>
            Situación
          </span>
          {q.story}
        </div>

        {stage === 'equation' ? (
          <>
            <p className="mb-3 font-semibold text-sky-100/85">
              ¿Qué ecuación representa el problema? (la incógnita es x)
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {eqOptions.map((eq) => {
                const picked = eqPicked === eq;
                const show = fb !== 'idle';
                const isAns = eq === q.equation;
                return (
                  <button
                    key={eq}
                    onClick={() => pickEq(eq)}
                    disabled={show}
                    className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 font-display text-lg font-bold text-white transition-all hover:bg-white/10 disabled:cursor-default"
                    style={{
                      borderColor:
                        show && isAns ? '#22c55e' : show && picked ? '#f43f5e' : undefined,
                      background:
                        show && isAns
                          ? 'rgba(34,197,94,0.15)'
                          : show && picked
                            ? 'rgba(244,63,94,0.15)'
                            : undefined,
                    }}
                  >
                    {eq}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-white/5 py-3 text-center font-display text-xl font-bold text-white">
              {q.equation}
            </div>
            <p className="font-semibold text-sky-100/85">Ahora resuelve: ¿cuánto vale x?</p>
            <div className="flex items-center justify-center gap-3 font-display text-2xl font-bold text-white">
              <span>x =</span>
              <input
                type="number"
                value={val}
                onChange={(e) => setVal(e.target.value)}
                className="w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center font-display text-2xl font-bold text-white outline-none focus:border-teal-400"
                placeholder="?"
              />
              <ActionButton accent={ACCENT} onClick={checkVal} disabled={!val}>
                Comprobar
              </ActionButton>
            </div>
          </div>
        )}
      </ChallengeCard>

      <Feedback status={fb}>
        {fb === 'correct'
          ? stage === 'equation'
            ? '¡Buena traducción! Ahora calcula el valor.'
            : '¡Problema resuelto!'
          : stage === 'equation'
            ? 'Identifica la incógnita y traduce cada frase. "El doble" es 2x.'
            : 'Combina los términos semejantes y luego despeja x.'}
      </Feedback>

      <div className="flex justify-start">
        <HintButton
          accent={ACCENT}
          hint={
            stage === 'equation'
              ? 'La incógnita es lo que te piden. "El doble" = 2x. "Suma" = +.'
              : `Suma los términos semejantes y divide entre el coeficiente de x.`
          }
        />
      </div>
    </div>
  );
}
