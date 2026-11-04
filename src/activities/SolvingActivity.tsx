import { useState } from 'react';
import type { ActivityProps } from '@/zones';
import { ChallengeCard, Feedback, HintButton, Prompt } from './ui';


const ACCENT = '#d97706';

interface Step {
  text: string;
  options: string[];
  answer: string;
  help: string;
}

interface Q {
  /** Initial equation displayed. */
  equation: string;
  steps: Step[];
}

const QUESTIONS: Q[] = [
  {
    equation: '2x + 3 = 11',
    steps: [
      {
        text: '¿Qué operación aplicas primero para acercarte a x?',
        options: ['Restar 3 a ambos lados', 'Dividir entre 2', 'Sumar 3', 'Multiplicar por 2'],
        answer: 'Restar 3 a ambos lados',
        help: 'Quita primero lo que está "más lejos" de la x: el +3.',
      },
      {
        text: 'Al restar 3 obtienes 2x = 8. ¿Qué haces ahora?',
        options: ['Sumar 2', 'Dividir entre 2', 'Restar 8', 'Multiplicar por 2'],
        answer: 'Dividir entre 2',
        help: 'El 2 multiplica a x; su operación inversa es dividir entre 2.',
      },
    ],
  },
  {
    equation: '3x - 5 = 10',
    steps: [
      {
        text: '¿Qué operación aplicas primero?',
        options: ['Sumar 5 a ambos lados', 'Dividir entre 3', 'Restar 5', 'Multiplicar por 3'],
        answer: 'Sumar 5 a ambos lados',
        help: 'Lo más lejos de x es el -5; su inversa es sumar 5.',
      },
      {
        text: 'Obtienes 3x = 15. ¿Cómo dejas x sola?',
        options: ['Dividir entre 3', 'Sumar 3', 'Restar 15', 'Multiplicar por 3'],
        answer: 'Dividir entre 3',
        help: 'El 3 multiplica a x; divide entre 3 a ambos lados.',
      },
    ],
  },
];

export default function SolvingActivity({ onSolved }: ActivityProps) {
  const [qi, setQi] = useState(0);
  const [si, setSi] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [fb, setFb] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [revealed, setRevealed] = useState(false);

  const q = QUESTIONS[qi];
  const step = q.steps[si];

  const choose = (opt: string) => {
    setPicked(opt);
    if (opt === step.answer) {
      setFb('correct');
      setTimeout(() => {
        if (si + 1 < q.steps.length) {
          setSi((s) => s + 1);
          setPicked(null);
          setFb('idle');
        } else if (qi + 1 < QUESTIONS.length) {
          setQi((i) => i + 1);
          setSi(0);
          setPicked(null);
          setFb('idle');
        } else {
          onSolved();
        }
      }, 1200);
    } else {
      setFb('wrong');
    }
  };

  return (
    <div className="space-y-5">
      <ChallengeCard accent={ACCENT}>
        <div className="mb-2 flex items-center justify-between">
          <Prompt accent={ACCENT}>Despeja x paso a paso</Prompt>
          <span className="text-xs font-bold text-sky-100/50">
            Ecuación {qi + 1} · Paso {si + 1}
          </span>
        </div>

        <div className="mb-5 rounded-xl bg-white/5 py-4 text-center font-display text-3xl font-bold text-white">
          {q.equation}
        </div>

        <p className="mb-3 font-semibold text-sky-100/85">{step.text}</p>

        <div className="grid gap-2 sm:grid-cols-2">
          {step.options.map((opt) => {
            const isPicked = picked === opt;
            const isAnswer = opt === step.answer;
            const show = fb !== 'idle';
            return (
              <button
                key={opt}
                onClick={() => choose(opt)}
                disabled={show}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-left font-semibold text-white transition-all hover:bg-white/10 disabled:cursor-default"
                style={{
                  borderColor:
                    show && isAnswer
                      ? '#22c55e'
                      : show && isPicked
                        ? '#f43f5e'
                        : undefined,
                  background:
                    show && isAnswer
                      ? 'rgba(34,197,94,0.15)'
                      : show && isPicked
                        ? 'rgba(244,63,94,0.15)'
                        : undefined,
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </ChallengeCard>

      <Feedback status={fb}>
        {fb === 'correct'
          ? '¡Paso correcto!'
          : `No es esa. ${revealed ? step.help : 'Pide una pista si lo necesitas.'}`}
      </Feedback>

      <div className="flex items-center justify-between gap-3">
        <HintButton accent={ACCENT} hint={step.help} />
        <button
          onClick={() => setRevealed(true)}
          className="text-xs text-sky-100/50 underline"
        >
          Mostrar ayuda en el mensaje
        </button>
      </div>
    </div>
  );
}
