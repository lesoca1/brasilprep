export const letters = ['A', 'B', 'C', 'D', 'E'] as const;
export type Letter = (typeof letters)[number];
export type Taxon = { key: string; name: string };
export type QuestionInput = {
  id: string;
  exam: string;
  year: number;
  phase: string;
  subject: Taxon;
  topic: Taxon;
  subtopic: Taxon;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple_choice';
  kind: 'synthetic' | 'official';
  statement: string;
  alternatives: Record<Letter, string>;
  correct_answer: Letter;
  explanation: string;
  source: { title: string; url: string | null; permission: string };
  images: { url: string; alt: string }[];
};
export type QuestionRow = {
  id: string;
  exam_id: string;
  year: number;
  kind: QuestionInput['kind'];
  difficulty: QuestionInput['difficulty'];
  payload: QuestionInput;
  created_at: string;
};
export type QuestionFilter = {
  exam: string;
  kind: string;
  difficulty: string;
  page: number;
};
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const nonempty = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= 20000;
export function safeMediaUrl(v: unknown): v is string {
  if (typeof v !== 'string') return false;
  if (/^\/question-media\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp|svg)$/.test(v))
    return true;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && !u.username && !u.password;
  } catch {
    return false;
  }
}
export function validateQuestionBatch(value: unknown): {
  questions: QuestionInput[];
  errors: string[];
} {
  const errors: string[] = [];
  if (!Array.isArray(value) || value.length < 1 || value.length > 500)
    return {
      questions: [],
      errors: ['O arquivo deve conter uma lista de 1 a 500 questões.'],
    };
  const ids = new Set<string>();
  value.forEach((q: unknown, i) => {
    const fail = (field: string) =>
      errors.push(`Questão ${i + 1}: ${field} inválido ou ausente.`);
    if (!object(q)) {
      fail('registro');
      return;
    }
    const allowed = [
      'id',
      'exam',
      'year',
      'phase',
      'subject',
      'topic',
      'subtopic',
      'difficulty',
      'type',
      'kind',
      'statement',
      'alternatives',
      'correct_answer',
      'explanation',
      'source',
      'images',
    ];
    if (Object.keys(q).some((k) => !allowed.includes(k)))
      fail('campo desconhecido');
    if (
      typeof q.id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
        q.id,
      )
    )
      fail('id UUID');
    else {
      if (ids.has(q.id)) fail('id duplicado');
      ids.add(q.id);
    }
    if (
      typeof q.exam !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(q.exam)
    )
      fail('exam');
    if (
      !Number.isInteger(q.year) ||
      Number(q.year) < 1900 ||
      Number(q.year) > 2100
    )
      fail('year');
    for (const k of ['phase', 'statement', 'explanation'])
      if (!nonempty(q[k])) fail(k);
    for (const k of ['subject', 'topic', 'subtopic']) {
      const t = q[k];
      if (
        !object(t) ||
        typeof t.key !== 'string' ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t.key) ||
        !nonempty(t.name) ||
        Object.keys(t).length !== 2
      )
        fail(k);
    }
    if (!['easy', 'medium', 'hard'].includes(String(q.difficulty)))
      fail('difficulty');
    if (q.type !== 'multiple_choice') fail('type');
    if (!['synthetic', 'official'].includes(String(q.kind))) fail('kind');
    if (
      !object(q.alternatives) ||
      Object.keys(q.alternatives).length !== 5 ||
      !letters.every(
        (l) => object(q.alternatives) && nonempty(q.alternatives[l]),
      )
    )
      fail('alternatives A-E');
    if (!letters.includes(q.correct_answer as Letter)) fail('correct_answer');
    if (
      !object(q.source) ||
      !nonempty(q.source.title) ||
      !nonempty(q.source.permission) ||
      !(
        q.source.url === null ||
        (typeof q.source.url === 'string' &&
          q.source.url.startsWith('https://') &&
          safeMediaUrl(q.source.url))
      ) ||
      (q.kind === 'official' && q.source.url === null)
    )
      fail('source e permissão de uso');
    if (
      !Array.isArray(q.images) ||
      q.images.length > 10 ||
      !q.images.every(
        (m) => object(m) && safeMediaUrl(m.url) && nonempty(m.alt),
      )
    )
      fail('images (URL e descrição)');
  });
  return { questions: errors.length ? [] : (value as QuestionInput[]), errors };
}
