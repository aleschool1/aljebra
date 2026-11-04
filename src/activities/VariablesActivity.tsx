import { useState } from 'react';
import type { ActivityProps } from '@/zones';
import { ActionButton, ChallengeCard, Feedback, HintButton, Prompt } from './ui';

const ACCENT = '#f59e0b';

type Part = 'variable' | 'constante' | 'coeficiente' | 'exponente' | 'operador';

interface Token {
  text: string;
  part: Part;
}

const TOKENS: Token[] = [
  { text: '7', part: 'coeficiente' },
  { text: 'x', part: 'variable' },
  { text: '²', part: 'exponente' },
  { text: '+', part: 'operador' },
  { text: '5', part: 'constante' },
];

const OPTIONS: Part[] = ['variable', 'constante', 'coeficiente', 'exponente', 'operador'];

const LABEL: Record<Part, string> = {
  variable: 'Variable',
  constante: 'Constante',
  coeficiente: 'Coeficiente',
  exponente: 'Exponente',
  operador: 'Operador',
};

export default function VariablesActivity({ onSolved }: ActivityProps) {
  const [assign, setAssign] = useState<Record<string, Part | null>>({});
  const [checked, setChecked] = useState(false);

  const allAssigned = TOKENS.every((t) => assign[t.text]);
  const check = () => {
    const ok = TOKENS.every((t) => assign[t.text] === t.part);
    if (ok) onSolved();
    else setChecked(true);
  };

  return (
    <div className="space-y-5">
      <ChallengeCard accent={ACCENT}>
        <Prompt accent={ACCENT}>
          Etiqueta cada parte de la expresión <span className="font-display">7x² + 5</span>
        </Prompt>
        <p className="mb-4 text-sm text-sky-100/70">
          Toca cada símbolo y luego elige qué tipo de elemento es.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {TOKENS.map((t) => (
            <span
              key={t.text}
              className="rounded-lg bg-white/10 px-4 py-2 font-display text-2xl font-bold text-white"
            >
              {t.text}
              <span
                className="ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                style={{
                  background: assign[t.text] ? `${ACCENT}40` : 'rgba(255,255,255,0.08)',
                  color: assign[t.text] ? ACCENT : 'rgba(255,255,255,0.4)',
                }}
              >
                {assign[t.text] ? LABEL[assign[t.text]!] : '...'}
              </span>
            </span>
          ))}
        </div>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-sky-100/70">Elige para el símbolo seleccionado:</p>
          <div className="flex flex-wrap gap-2">
            {OPTIONS.map((o) => {
              return (
                <button
                  key={o}
                  onClick={() => {
                    // Assign to the first unassigned token
                    const target = TOKENS.find((t) => !assign[t.text]);
                    if (target) setAssign((a) => ({ ...a, [target.text]: o }));
                  }}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  {LABEL[o]}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setAssign({})}
            className="mt-3 text-xs text-sky-100/50 underline"
          >
            Reiniciar etiquetas
          </button>
        </div>
      </ChallengeCard>

      <Feedback status={checked ? 'wrong' : 'idle'}>
        Revisa: el coeficiente multiplica a la variable, el exponente está arriba, la constante va sola.
      </Feedback>

      <div className="flex items-center justify-between gap-3">
        <HintButton accent={ACCENT} hint="7 multiplica a x → coeficiente. x es la letra → variable. ² está arriba → exponente. + es operador. 5 va solo → constante." />
        <ActionButton accent={ACCENT} onClick={check} disabled={!allAssigned}>
          Comprobar
        </ActionButton>
      </div>
    </div>
  );
}
