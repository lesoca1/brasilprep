/** Synthetic design fixtures. Never use these values as production analytics. */
export type ExamId = 'fuvest' | 'unicamp';
export type SubjectResult = {
  name: string;
  accuracy: number;
  answered: number;
  note: string;
};
export type DemoTrack = {
  id: ExamId;
  exam: string;
  institution: string;
  course: string;
  campus: string;
  accuracy: string;
  target: string;
  gap: string;
  answered: string;
  subjects: SubjectResult[];
  trend: { month: string; accuracy: number }[];
  practice: {
    subject: string;
    topic: string;
    count: number;
    difficulty: string;
  };
};
export const demoTracks: Record<ExamId, DemoTrack> = {
  fuvest: {
    id: 'fuvest',
    exam: 'FUVEST',
    institution: 'USP',
    course: 'Economia',
    campus: 'FEA · São Paulo',
    accuracy: '72,4%',
    target: '76,0%',
    gap: '3,6 p.p.',
    answered: '1.284',
    subjects: [
      { name: 'História', accuracy: 86, answered: 180, note: 'Maior acerto' },
      { name: 'Matemática', accuracy: 81, answered: 264, note: 'Maior acerto' },
      { name: 'Geografia', accuracy: 78, answered: 160, note: '' },
      { name: 'Português', accuracy: 75, answered: 220, note: '' },
      { name: 'Biologia', accuracy: 69, answered: 160, note: '' },
      { name: 'Química', accuracy: 61, answered: 140, note: 'Revisar' },
      { name: 'Física', accuracy: 48, answered: 160, note: 'Revisar' },
    ],
    trend: [
      { month: 'Mai', accuracy: 61 },
      { month: 'Jun', accuracy: 65 },
      { month: 'Jul', accuracy: 69 },
      { month: 'Ago', accuracy: 73 },
    ],
    practice: {
      subject: 'Física',
      topic: 'Eletricidade',
      count: 15,
      difficulty: 'Média',
    },
  },
  unicamp: {
    id: 'unicamp',
    exam: 'UNICAMP',
    institution: 'UNICAMP',
    course: 'Ciências Econômicas',
    campus: 'Instituto de Economia · Campinas',
    accuracy: '65,0%',
    target: '74,0%',
    gap: '9,0 p.p.',
    answered: '360',
    subjects: [
      { name: 'História', accuracy: 80, answered: 40, note: 'Maior acerto' },
      { name: 'Português', accuracy: 75, answered: 60, note: 'Maior acerto' },
      { name: 'Geografia', accuracy: 70, answered: 40, note: '' },
      { name: 'Matemática', accuracy: 65, answered: 80, note: '' },
      { name: 'Biologia', accuracy: 60, answered: 40, note: '' },
      { name: 'Química', accuracy: 50, answered: 60, note: 'Revisar' },
      { name: 'Física', accuracy: 45, answered: 40, note: 'Revisar' },
    ],
    trend: [
      { month: 'Mai', accuracy: 52 },
      { month: 'Jun', accuracy: 57 },
      { month: 'Jul', accuracy: 61 },
      { month: 'Ago', accuracy: 65 },
    ],
    practice: {
      subject: 'Química',
      topic: 'Estequiometria',
      count: 12,
      difficulty: 'Média',
    },
  },
};
export const sessions = [
  {
    id: 's1',
    exam: 'fuvest',
    date: '28 ago',
    title: 'Eletricidade',
    subject: 'Física',
    count: 15,
    accuracy: '60%',
    time: '32 min',
  },
  {
    id: 's2',
    exam: 'fuvest',
    date: '26 ago',
    title: 'Funções',
    subject: 'Matemática',
    count: 20,
    accuracy: '85%',
    time: '41 min',
  },
  {
    id: 's3',
    exam: 'fuvest',
    date: '24 ago',
    title: 'Brasil República',
    subject: 'História',
    count: 20,
    accuracy: '90%',
    time: '24 min',
  },
  {
    id: 's4',
    exam: 'unicamp',
    date: '27 ago',
    title: 'Estequiometria',
    subject: 'Química',
    count: 10,
    accuracy: '50%',
    time: '25 min',
  },
  {
    id: 's5',
    exam: 'unicamp',
    date: '25 ago',
    title: 'Interpretação de texto',
    subject: 'Português',
    count: 12,
    accuracy: '75%',
    time: '28 min',
  },
] as const;
export type DemoQuestion = {
  id: string;
  exam: ExamId;
  subject: string;
  topic: string;
  difficulty: string;
  statement: string;
  alternatives: string[];
  answer: string;
  explanation: string;
};
export const questions: DemoQuestion[] = [
  {
    id: 'SYN-001',
    exam: 'fuvest',
    subject: 'Física',
    topic: 'Eletricidade',
    difficulty: 'Fácil',
    statement:
      'Um resistor de 6 Ω é submetido a uma tensão de 12 V. Qual é a corrente elétrica que o atravessa?',
    alternatives: ['0,5 A', '2 A', '6 A', '18 A', '72 A'],
    answer: 'B',
    explanation: 'Pela lei de Ohm, U = R × i. Portanto, i = 12 ÷ 6 = 2 A.',
  },
  {
    id: 'SYN-002',
    exam: 'fuvest',
    subject: 'Matemática',
    topic: 'Funções',
    difficulty: 'Fácil',
    statement:
      'Uma função é definida por f(x) = 2x + 3. Qual é o valor de f(4)?',
    alternatives: ['5', '7', '8', '11', '14'],
    answer: 'D',
    explanation: 'Substituindo x por 4: f(4) = 2 × 4 + 3 = 11.',
  },
  {
    id: 'SYN-003',
    exam: 'fuvest',
    subject: 'Química',
    topic: 'Estequiometria',
    difficulty: 'Média',
    statement:
      'Considere a reação 2 H₂ + O₂ → 2 H₂O. Com oxigênio em excesso, quantos mols de água podem ser formados a partir de 3 mols de H₂?',
    alternatives: ['1', '1,5', '2', '3', '6'],
    answer: 'D',
    explanation:
      'A proporção molar entre H₂ e H₂O é de 1 para 1. Assim, 3 mols de H₂ formam 3 mols de água.',
  },
  {
    id: 'SYN-004',
    exam: 'unicamp',
    subject: 'Química',
    topic: 'Estequiometria',
    difficulty: 'Fácil',
    statement:
      'Uma amostra contém 2 mols de uma substância cuja massa molar é 18 g/mol. Qual é a massa da amostra?',
    alternatives: ['9 g', '18 g', '20 g', '36 g', '40 g'],
    answer: 'D',
    explanation:
      'A massa é o produto da quantidade de matéria pela massa molar: 2 × 18 = 36 g.',
  },
  {
    id: 'SYN-005',
    exam: 'unicamp',
    subject: 'Matemática',
    topic: 'Probabilidade',
    difficulty: 'Fácil',
    statement:
      'Uma urna contém 3 bolas azuis e 2 vermelhas. Qual é a probabilidade de retirar uma bola azul em um sorteio equiprovável?',
    alternatives: ['1/5', '2/5', '1/2', '3/5', '2/3'],
    answer: 'D',
    explanation:
      'Há 3 resultados favoráveis entre 5 bolas. A probabilidade é 3/5.',
  },
];
