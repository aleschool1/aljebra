import { useState } from 'react';
import type { ActivityProps } from '@/zones';
import { ActionButton, ChallengeCard, Feedback, HintButton, Prompt } from './ui';

const ACCENT = '#3b82f6';

interface Q {
  left: { coef: number; const: number };
  answer: number;
}

const QUESTIONS: Q[] = [
  { left: { coef: 1, const: 4 }, answer: 6 },
  { left: { coef: 1, const: -2 }, answer: 5 },
  { left: { coef: 2, const: 0 }, answer: 7 },
];

/**
 * Balance-scale metaphor. Student chooses an operation to apply to BOTH sides
 * until x is isolated, then enters its value.
 */
export default function EquationsActivity({ onSolved }: ActivityProps) {
  const [qi, setQi] = useState(0);
  const q = QUESTIONS[qi];
  const [coef, setCoef] = useState(q.left.coef);
  const [c, setC] = useState(q.left.const);
  const [rhs, setRhs] = useState(q.left.coef * q.answer + q.left.const);
  const [stage, setStage] = useState<'balance' | 'value'>('balance');
  const [val, setVal] = useState('');
  const [fb, setFb] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const apply = (op: 'add' | 'sub' | 'div', n: number) => {
    if (op === 'add') {
      setC((v) => v + n);
      setRhs((v) => v + n);
    } else if (op === 'sub') {
      setC((v) => v - n);
      setRhs((v) => v - n);
    } else if (op === 'div') {
      setCoef((v) => v / n);
      setC((v) => v / n);
      setRhs((v) => v / n);
    }
  };

  const isolated = coef === 1 && c === 0;

  const checkValue = () => {
    if (parseInt(val, 10) === q.answer) {
      if (qi + 1 >= QUESTIONS.length) {
        onSolved();
        setFb('correct');
      } else {
        setFb('correct');
        setTimeout(() => {
          const ni = qi + 1;
          setQi(ni);
          const nq = QUESTIONS[ni] ?? QUESTIONS[0];
          setCoef(nq.left.coef);
          setC(nq.left.const);
          setRhs(nq.left.coef * nq.answer + nq.left.const);
          setStage('balance');
          setVal('');
          setFb('idle');
        }, 1200);
      }
    } else {
      setFb('wrong');
    }
  };

  const fmtLeft = `${coef === 1 ? '' : coef}x${c === 0 ? '' : c > 0 ? ` + ${c}` : ` - ${-c}`}`;

  return (
    <div className="space-y-5">
      <ChallengeCard accent={ACCENT}>
        <div className="mb-2 flex items-center justify-between">
          <Prompt accent={ACCENT}>Equilibra la balanza hasta dejar x solo</Prompt>
          <span className="text-xs font-bold text-sky-100/50">
            Reto {qi + 1} de {QUESTIONS.length}
          </span>
        </div>

        <p className="mb-4 text-sm text-sky-100/70">
          Lo que hagas a un lado, se hace al otro. Usa los botones para aplicar
          operaciones inversas a <strong>ambos lados</strong>.
        </p>

        {/* Balance visual */}
        <div className="mb-5 rounded-xl bg-white/5 py-5">
          <div className="flex items-center justify-center gap-4 font-display text-2xl font-bold text-white">
            <span>{fmtLeft}</span>
            <span className="text-sky-300">=</span>
            <span>{rhs}</span>
          </div>
          <div className="mx-auto mt-3 h-2 w-40 rounded-full bg-blue-400/30" />
          <div className="mx-auto h-6 w-1 bg-blue-400/30" />
        </div>

        {stage === 'balance' ? (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <OpBtn label="- const" onClick={() => apply('sub', Math.abs(c))} disabled={c === 0} accent={ACCENT} />
              <OpBtn label="+ const" onClick={() => apply('add', Math.abs(c))} disabled={c === 0} accent={ACCENT} />
              <OpBtn label={`÷ coef (${coef})`} onClick={() => apply('div', coef)} disabled={coef === 1} accent={ACCENT} />
              <OpBtn label="Reiniciar" onClick={() => { setCoef(q.left.coef); setC(q.left.const); setRhs(q.left.coef * q.answer + q.left.const); }} accent={ACCENT} />
            </div>

            <div className="mt-4 flex justify-end">
              <ActionButton
                accent={ACCENT}
                disabled={!isolated}
                onClick={() => setStage('value')}
              >
                {isolated ? 'x está solo → calcular' : 'Sigue operando'}
              </ActionButton>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 font-display text-2xl font-bold text-white">
            <span>x =</span>
            <input
              type="number"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center font-display text-2xl font-bold text-white outline-none focus:border-blue-400"
              placeholder="?"
            />
            <ActionButton accent={ACCENT} onClick={checkValue} disabled={!val}>
              Comprobar
            </ActionButton>
          </div>
        )}
      </ChallengeCard>

      <Feedback status={fb}>
        {fb === 'correct'
          ? '¡Ecuación resuelta! La balanza quedó equilibrada.'
          : 'Aplica la operación contraria: si suma, resta; si multiplica, divide. Siempre a ambos lados.'}
      </Feedback>

      {stage === 'balance' && (
        <div className="flex justify-start">
          <HintButton
            accent={ACCENT}
            hint={`Primero elimina la constante ${c > 0 ? `restando ${c}` : `sumando ${-c}`} a ambos lados. Después divide entre ${coef}.`}
          />
        </div>
      )}
    </div>
  );
}

function OpBtn({
  label,
  onClick,
  disabled,
  accent,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10 disabled:opacity-30"
      style={{ borderColor: disabled ? undefined : `${accent}55` }}
    >
      {label}
    </button>
  );
}
