import type { ComponentType } from 'react';
import {
  Compass,
  Variable,
  Languages,
  Braces,
  Combine,
  Calculator,
  Scale,
  KeyRound,
  HelpCircle,
  FunctionSquare,
  type LucideProps,
} from 'lucide-react';

import IntroActivity from '@/activities/IntroActivity';
import VariablesActivity from '@/activities/VariablesActivity';
import LanguageActivity from '@/activities/LanguageActivity';
import ExpressionsActivity from '@/activities/ExpressionsActivity';
import LikeTermsActivity from '@/activities/LikeTermsActivity';
import OperationsActivity from '@/activities/OperationsActivity';
import EquationsActivity from '@/activities/EquationsActivity';
import SolvingActivity from '@/activities/SolvingActivity';
import WordProblemsActivity from '@/activities/WordProblemsActivity';
import FunctionsActivity from '@/activities/FunctionsActivity';

export interface ZoneContent {
  /** Short teaching text shown in the "Aprende" tab. */
  explanation: string;
  /** Worked examples, each with a statement and a step-by-step solution. */
  examples: { statement: string; steps: string[] }[];
  /** A hint shown when the student asks for help inside the activity. */
  hint: string;
}

export interface Zone {
  id: string;
  /** Position on the 1200x700 SVG viewBox. */
  x: number;
  y: number;
  title: string;
  subtitle: string;
  /** Hex used for the node, aura and accents. */
  color: string;
  /** Secondary accent for gradients. */
  accent: string;
  /** A one-line tagline shown on hover/selected. */
  tagline: string;
  icon: ComponentType<LucideProps>;
  /** The React component that renders the interactive activity. */
  activity: ComponentType<ActivityProps>;
  content: ZoneContent;
}

/** Props every activity receives. */
export interface ActivityProps {
  onSolved: () => void;
  solved: boolean;
}

export const ZONES: Zone[] = [
  {
    id: 'intro',
    x: 130,
    y: 360,
    title: 'Introducción',
    subtitle: '¿Qué es el álgebra?',
    color: '#7dd3fc',
    accent: '#0ea5e9',
    tagline: 'El punto de partida de tu aventura',
    icon: Compass,
    activity: IntroActivity,
    content: {
      explanation:
        'El álgebra es la rama de las matemáticas que usa letras y símbolos para representar números desconocidos y relaciones entre ellos. Con ella podemos resolver problemas generales, no solo uno a la vez.',
      examples: [
        {
          statement: 'En lugar de decir "un número más tres", escribimos x + 3.',
          steps: ['x representa cualquier número', 'x + 3 significa "ese número más 3"'],
        },
      ],
      hint: 'Piensa en las letras como cajas que guardan un número que todavía no conoces.',
    },
  },
  {
    id: 'variables',
    x: 310,
    y: 250,
    title: 'Variables',
    subtitle: 'Letras que valen por números',
    color: '#fbbf24',
    accent: '#f59e0b',
    tagline: 'Descubre qué representa cada letra',
    icon: Variable,
    activity: VariablesActivity,
    content: {
      explanation:
        'Una variable es una letra que representa un número que puede cambiar o que aún no conocemos. Una constante es un valor fijo que no cambia. En 3x + 5, la x es la variable y 5 es la constante.',
      examples: [
        {
          statement: 'En la expresión 2y + 7',
          steps: ['y es la variable (puede valer cualquier número)', '2 es el coeficiente de y', '7 es la constante'],
        },
      ],
      hint: 'Las letras son variables; los números sueltos suelen ser constantes.',
    },
  },
  {
    id: 'lenguaje',
    x: 470,
    y: 380,
    title: 'Lenguaje Algebraico',
    subtitle: 'De palabras a símbolos',
    color: '#f472b6',
    accent: '#ec4899',
    tagline: 'Traduce frases a expresiones',
    icon: Languages,
    activity: LanguageActivity,
    content: {
      explanation:
        'El lenguaje algebraico traduce frases del español a expresiones matemáticas. "El doble de un número" se escribe 2x, "la suma de un número y 4" se escribe x + 4.',
      examples: [
        {
          statement: 'Traduce: "el triple de un número menos 5"',
          steps: ['"el triple" → 3x', '"menos 5" → - 5', 'Resultado: 3x - 5'],
        },
      ],
      hint: 'Cada palabra clave tiene un símbolo: doble (2x), triple (3x), suma (+), diferencia (-), producto (·).',
    },
  },
  {
    id: 'expresiones',
    x: 620,
    y: 260,
    title: 'Expresiones',
    subtitle: 'Construye con términos',
    color: '#34d399',
    accent: '#10b981',
    tagline: 'Coeficientes, variables y exponentes',
    icon: Braces,
    activity: ExpressionsActivity,
    content: {
      explanation:
        'Una expresión algebraica combina números, variables y operaciones. Cada parte separada por + o - es un término. En 4x² + 2x - 7 hay tres términos: 4x², 2x y -7.',
      examples: [
        {
          statement: 'Identifica las partes de 5x³',
          steps: ['5 es el coeficiente', 'x es la variable', '3 es el exponente'],
        },
      ],
      hint: 'El coeficiente es el número que multiplica, el exponente es el número arriba de la variable.',
    },
  },
  {
    id: 'semejantes',
    x: 800,
    y: 380,
    title: 'Términos Semejantes',
    subtitle: 'Combina lo parecido',
    color: '#a78bfa',
    accent: '#8b5cf6',
    tagline: 'Suma y resta términos del mismo tipo',
    icon: Combine,
    activity: LikeTermsActivity,
    content: {
      explanation:
        'Dos términos son semejantes cuando tienen la misma parte literal (las mismas variables con los mismos exponentes). Solo cambia el coeficiente. Los términos semejantes se pueden sumar o restar combinando sus coeficientes.',
      examples: [
        {
          statement: 'Reduce 3x + 5x - 2x',
          steps: ['Todos son términos semejantes (parte literal x)', 'Suma coeficientes: 3 + 5 - 2 = 6', 'Resultado: 6x'],
        },
      ],
      hint: 'Mira solo la parte literal. Si es igual, combina los números de enfrente.',
    },
  },
  {
    id: 'operaciones',
    x: 990,
    y: 250,
    title: 'Operaciones',
    subtitle: 'Suma, resta y multiplica',
    color: '#fb7185',
    accent: '#f43f5e',
    tagline: 'Manipula expresiones y observa',
    icon: Calculator,
    activity: OperationsActivity,
    content: {
      explanation:
        'Con expresiones algebraicas puedes sumar, restar y multiplicar. Al sumar, combinas términos semejantes. Al multiplicar, multiplicas coeficientes y sumas exponentes de las mismas variables.',
      examples: [
        {
          statement: 'Multiplica (2x)(3x²)',
          steps: ['Multiplica coeficientes: 2 · 3 = 6', 'Suma exponentes de x: 1 + 2 = 3', 'Resultado: 6x³'],
        },
      ],
      hint: 'Para multiplicar potencias con la misma base, suma los exponentes: x · x² = x³.',
    },
  },
  {
    id: 'ecuaciones',
    x: 1080,
    y: 470,
    title: 'Ecuaciones',
    subtitle: 'Equilibra la igualdad',
    color: '#60a5fa',
    accent: '#3b82f6',
    tagline: 'Lo que le haces a un lado, al otro',
    icon: Scale,
    activity: EquationsActivity,
    content: {
      explanation:
        'Una ecuación es una igualdad entre dos expresiones. Tiene el símbolo =. Para resolverla, el objetivo es descubrir el valor de la incógnita manteniendo la balanza equilibrada: lo que haces a un lado, debes hacerlo al otro.',
      examples: [
        {
          statement: 'Resuelve x + 4 = 10',
          steps: ['Resta 4 a ambos lados: x + 4 - 4 = 10 - 4', 'x = 6', 'Comprobación: 6 + 4 = 10 ✓'],
        },
      ],
      hint: 'Piensa en una balanza: si quitas algo de un lado, quita lo mismo del otro para que no se desequilibre.',
    },
  },
  {
    id: 'despeje',
    x: 870,
    y: 560,
    title: 'Despeje',
    subtitle: 'Aisla la incógnita',
    color: '#f59e0b',
    accent: '#d97706',
    tagline: 'Operaciones inversas paso a paso',
    icon: KeyRound,
    activity: SolvingActivity,
    content: {
      explanation:
        'Despejar significa dejar sola la incógnita en un lado de la ecuación usando operaciones inversas: si suma, resta; si multiplica, divide; si divide, multiplica. Cada operación se aplica a ambos lados.',
      examples: [
        {
          statement: 'Despeja x en 2x + 3 = 11',
          steps: ['Resta 3: 2x = 8', 'Divide entre 2: x = 4', 'Comprobación: 2(4) + 3 = 11 ✓'],
        },
      ],
      hint: 'Usa la operación contraria. Empieza alejando lo que está más lejos de la x (lo que no multiplica).',
    },
  },
  {
    id: 'problemas',
    x: 540,
    y: 560,
    title: 'Problemas',
    subtitle: 'De la vida real al álgebra',
    color: '#2dd4bf',
    accent: '#14b8a6',
    tagline: 'Convierte situaciones en ecuaciones',
    icon: HelpCircle,
    activity: WordProblemsActivity,
    content: {
      explanation:
        'Un problema algebraico describe una situación real con palabras. La clave es identificar la incógnita, representarla con una letra y traducir el problema a una ecuación que puedas resolver.',
      examples: [
        {
          statement: 'Piensa: "un número más su doble es 12"',
          steps: ['Llamamos al número x', 'Su doble es 2x', 'Ecuación: x + 2x = 12 → 3x = 12 → x = 4'],
        },
      ],
      hint: 'Primero decide qué es la incógnita (lo que te piden). Después traduce cada frase a una expresión con esa letra.',
    },
  },
  {
    id: 'funciones',
    x: 290,
    y: 540,
    title: 'Funciones',
    subtitle: 'Máquinas que transforman',
    color: '#c084fc',
    accent: '#a855f7',
    tagline: 'Entra un número, sale otro',
    icon: FunctionSquare,
    activity: FunctionsActivity,
    content: {
      explanation:
        'Una función es como una máquina: entra un número (entrada) y sale otro (salida) siguiendo una regla. Se escribe f(x) = ..., donde x es la entrada. Por ejemplo, f(x) = 2x + 1 duplica la entrada y le suma 1.',
      examples: [
        {
          statement: 'Calcula f(3) con f(x) = 2x + 1',
          steps: ['Sustituye x por 3: f(3) = 2(3) + 1', 'Multiplica: 2 · 3 = 6', 'Suma: 6 + 1 = 7 → f(3) = 7'],
        },
      ],
      hint: 'Sustituye la x por el número de entrada y realiza las operaciones en orden.',
    },
  },
];

/** Connection paths drawn as roads/trails between consecutive zones. */
export const PATHS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [8, 9],
];
