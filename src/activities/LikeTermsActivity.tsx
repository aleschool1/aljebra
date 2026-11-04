import { useMemo, useState } from 'react';
import type { ActivityProps } from '@/zones';
import { ActionButton, ChallengeCard, Feedback, HintButton, Prompt } from './ui';

const ACCENT = '#8b5cf6';

interface Group {
  terms: { text: string; coef: number; literal: string }[];
  answer: number;
}

const GROUPS: Group[] = [
  {
    terms: [
      { text: '3x', coef: 3, literal: 'x' },
      { text: '5x', coef: 5, literal: 'x' },
      { text: '-2x', coef: -2, literal: 'x' },
    ],
    answer: 6,
  },
  {
    terms: [
      { text: '4a', coef: 4, literal: 'a' },
      { text: '-a', coef: -1, literal: 'a' },
      { text: '7a', coef: 7, literal: 'a' },
    ],
    answer: 10,
  },
];

export default function LikeTermsActivity({ onSolved }: ActivityProps) {
  const [gi, setGi] = useState(0);
  const group = GROUPS[gi];
  const [ans, setAns] = useState('');
  const [fb, setFb] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const literal = useMemo(() => group.terms[0].literal, [group]);

  const submit = () => {
    if (parseInt(ans, 10) === group.answer) {
      if (gi + 1 >= GROUPS.length) {
        onSolved();
      } else {
        setFb('correct');
        setTimeout(() => {
          setGi((i) => i + 1);
          setAns('');
          setFb('idle');
        }, 1100);
        return;
      }
      setFb('correct');
    } else {
      setFb('wrong');
    }
  };

  return (
    <div className="space-y-5">
      <ChallengeCard accent={ACCENT}>
        <div className="mb-2 flex items-center justify-between">
          <Prompt accent={ACCENT}>Combina los términos semejantes</Prompt>
          <span className="text-xs font-bold text-sky-100/50">
            Reto {gi + 1} de {GROUPS.length}
          </span>
        </div>

        <p className="mb-4 text-sm text-sky-100/70">
          Todos estos términos son semejantes (misma parte literal <strong>{literal}</strong>).
          Suma sus coeficientes y escribe el resultado.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {group.terms.map((t, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="rounded-lg bg-white/10 px-4 py-2 font-display text-2xl font-bold text-white">
                {t.text}
              </span>
              {i < group.terms.length - 1 && (
                <span className="font-display text-xl text-sky-100/50">+</span>
              )}
            </span>
          ))}
          <span className="font-display text-2xl text-sky-100/50">=</span>
          <input
            type="text"
            value={ans}
            onChange={(e) => setAns(e.target.value)}
            className="w-24 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-center font-display text-2xl font-bold text-white outline-none focus:border-violet-400"
            placeholder="?x"
          />
        </div>
      </ChallengeCard>

      <Feedback status={fb}>
        {fb === 'correct'
          ? '¡Exacto! Sumaste los coeficientes y conservaste la parte literal.'
          : 'Suma los números de enfrente (incluido su signo). La parte literal (la letra) se queda igual.'}
      </Feedback>

      <div className="flex items-center justify-between gap-3">
        <HintButton
          accent={ACCENT}
          hint={`Suma los coeficientes: ${group.terms.map((t) => t.coef).join(' + ')}. La letra ${literal} se conserva.`}
        />
        <ActionButton accent={ACCENT} onClick={submit} disabled={!ans}>
          Comprobar
        </ActionButton>
      </div>
    </div>
  );
}
