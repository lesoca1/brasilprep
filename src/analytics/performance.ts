import type { Letter, Taxon, QuestionInput } from '@/domain/questions';
import type { PracticeSession } from '@/domain/practice';
export type AnswerRecord = {
  session_id: string;
  position: number;
  question_id: string;
  exam_id: string;
  mode: 'study' | 'test';
  kind: 'synthetic' | 'official';
  submitted_at: string | null;
  answered_at: string | null;
  subject: Taxon;
  topic: Taxon;
  subtopic: Taxon;
  difficulty: QuestionInput['difficulty'];
  selected: Letter | null;
  correct: boolean | null;
  spent_ms: number;
};
export type AnswerDataset = { as_of: string; rows: AnswerRecord[] };
export type Metrics = {
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
  blank: number;
  accuracy: number | null;
  averageTimeMs: number | null;
  uniqueQuestions: number;
  uniqueAnswered: number;
  sessions: number;
  smallSample: boolean;
};
export type MetricGroup = { key: string; label: string; metrics: Metrics };
const text = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;
const taxon = (v: unknown): v is Taxon =>
  Boolean(
    v &&
    typeof v === 'object' &&
    'key' in v &&
    'name' in v &&
    text(v.key) &&
    text(v.name),
  );
function timestamp(value: unknown): number {
  if (
    typeof value !== 'string' ||
    !/(Z|[+-]\d\d:\d\d)$/.test(value) ||
    !Number.isFinite(Date.parse(value))
  )
    throw new Error('Data inválida no histórico.');
  return Date.parse(value);
}
/** Reject corrupt data; never turn missing correctness into an incorrect answer. */
export function cleanAnswers(rows: AnswerRecord[]): AnswerRecord[] {
  const unique = new Map<string, AnswerRecord>();
  const sessions = new Map<string, string>();
  const questions = new Map<string, number>();
  for (const row of rows) {
    if (row.submitted_at === null) continue;
    const finish = timestamp(row.submitted_at);
    if (
      !text(row.session_id) ||
      !text(row.question_id) ||
      !text(row.exam_id) ||
      !Number.isInteger(row.position) ||
      row.position < 0 ||
      !['study', 'test'].includes(row.mode) ||
      !['synthetic', 'official'].includes(row.kind) ||
      !['easy', 'medium', 'hard'].includes(row.difficulty) ||
      !taxon(row.subject) ||
      !taxon(row.topic) ||
      !taxon(row.subtopic) ||
      !Number.isInteger(row.spent_ms) ||
      row.spent_ms < 0 ||
      row.spent_ms > 604800000
    )
      throw new Error('Registro inválido no histórico.');
    if (row.selected === null) {
      if (row.correct !== null || row.answered_at !== null)
        throw new Error('Resposta em branco inconsistente.');
    } else if (
      !['A', 'B', 'C', 'D', 'E'].includes(row.selected) ||
      typeof row.correct !== 'boolean' ||
      timestamp(row.answered_at) > finish
    )
      throw new Error('Correção ou data da resposta inconsistente.');
    const metadata = JSON.stringify([
      row.exam_id,
      row.mode,
      row.kind,
      row.submitted_at,
    ]);
    if (
      sessions.has(row.session_id) &&
      sessions.get(row.session_id) !== metadata
    )
      throw new Error('Metadados inconsistentes na sessão.');
    sessions.set(row.session_id, metadata);
    const questionKey = JSON.stringify([row.session_id, row.question_id]);
    if (
      questions.has(questionKey) &&
      questions.get(questionKey) !== row.position
    )
      throw new Error('Questão duplicada na mesma sessão.');
    questions.set(questionKey, row.position);
    const key = JSON.stringify([row.session_id, row.position]);
    const previous = unique.get(key);
    const fingerprint = (r: AnswerRecord) =>
      JSON.stringify([
        r.session_id,
        r.position,
        r.question_id,
        r.exam_id,
        r.mode,
        r.kind,
        r.submitted_at,
        r.answered_at,
        r.subject.key,
        r.subject.name,
        r.topic.key,
        r.topic.name,
        r.subtopic.key,
        r.subtopic.name,
        r.difficulty,
        r.selected,
        r.correct,
        r.spent_ms,
      ]);
    if (previous && fingerprint(previous) !== fingerprint(row))
      throw new Error('Registros duplicados com valores diferentes.');
    unique.set(key, row);
  }
  return [...unique.values()];
}
/** A total must have exactly one exam, answering mode and content origin. */
export function totalAccuracy(input: AnswerRecord[]): Metrics {
  const rows = cleanAnswers(input);
  if (
    new Set(rows.map((r) => JSON.stringify([r.exam_id, r.mode, r.kind]))).size >
    1
  )
    throw new Error(
      'Não misture vestibulares, modos ou origens em uma métrica.',
    );
  const total = rows.length,
    answered = rows.filter((r) => r.selected !== null).length,
    correct = rows.filter((r) => r.correct === true).length;
  const uniqueAnswered = new Set(
    rows.filter((r) => r.selected !== null).map((r) => r.question_id),
  ).size;
  return {
    total,
    answered,
    correct,
    incorrect: answered - correct,
    blank: total - answered,
    accuracy: total ? (100 * correct) / total : null,
    averageTimeMs: total
      ? rows.reduce((n, r) => n + r.spent_ms, 0) / total
      : null,
    uniqueQuestions: new Set(rows.map((r) => r.question_id)).size,
    uniqueAnswered,
    sessions: new Set(rows.map((r) => r.session_id)).size,
    smallSample: uniqueAnswered < 20,
  };
}
export type Dimension =
  'exam' | 'subject' | 'topic' | 'subtopic' | 'difficulty';
export function accuracyBy(
  input: AnswerRecord[],
  dimension: Dimension,
): MetricGroup[] {
  const groups = new Map<string, { label: string; rows: AnswerRecord[] }>();
  for (const r of cleanAnswers(input)) {
    const scope = [r.exam_id, r.mode, r.kind];
    const path =
      dimension === 'subject'
        ? [r.subject.key]
        : dimension === 'topic'
          ? [r.subject.key, r.topic.key]
          : dimension === 'subtopic'
            ? [r.subject.key, r.topic.key, r.subtopic.key]
            : dimension === 'difficulty'
              ? [r.difficulty]
              : [];
    const key = JSON.stringify([...scope, ...path]);
    const label =
      dimension === 'exam'
        ? r.exam_id.toUpperCase()
        : dimension === 'subject'
          ? r.subject.name
          : dimension === 'topic'
            ? `${r.subject.name} / ${r.topic.name}`
            : dimension === 'subtopic'
              ? `${r.subject.name} / ${r.topic.name} / ${r.subtopic.name}`
              : { easy: 'Fácil', medium: 'Média', hard: 'Difícil' }[
                  r.difficulty
                ];
    const group = groups.get(key) ?? { label, rows: [] };
    group.rows.push(r);
    groups.set(key, group);
  }
  return [...groups]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, g]) => ({
      key,
      label: g.label,
      metrics: totalAccuracy(g.rows),
    }));
}
const DAY = 86400000;
export function recentPerformance(input: AnswerRecord[], asOf: string) {
  const end = timestamp(asOf);
  const rows = cleanAnswers(input);
  totalAccuracy(rows);
  return {
    current: totalAccuracy(
      rows.filter(
        (r) =>
          timestamp(r.submitted_at) >= end - 30 * DAY &&
          timestamp(r.submitted_at) <= end,
      ),
    ),
    previous: totalAccuracy(
      rows.filter(
        (r) =>
          timestamp(r.submitted_at) >= end - 60 * DAY &&
          timestamp(r.submitted_at) < end - 30 * DAY,
      ),
    ),
  };
}
const monthFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
});
export function historicalPerformance(input: AnswerRecord[]): MetricGroup[] {
  totalAccuracy(input);
  const groups = new Map<string, AnswerRecord[]>();
  for (const r of cleanAnswers(input)) {
    const parts = monthFormatter.formatToParts(
      new Date(timestamp(r.submitted_at)),
    );
    const key = `${parts.find((p) => p.type === 'year')!.value}-${parts.find((p) => p.type === 'month')!.value}`;
    const group = groups.get(key) ?? [];
    group.push(r);
    groups.set(key, group);
  }
  return [...groups]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, rows]) => ({
      key,
      label: `${key.slice(5)}/${key.slice(0, 4)}`,
      metrics: totalAccuracy(rows),
    }));
}
export function sessionAnswers(session: PracticeSession): AnswerRecord[] {
  if (!session.submitted_at)
    throw new Error('Finalize a sessão para consultar a análise.');
  return cleanAnswers(
    session.items.map((i) => ({
      session_id: session.id,
      position: i.position,
      question_id: i.question_id,
      exam_id: session.exam_id,
      mode: session.mode,
      kind: session.kind,
      submitted_at: session.submitted_at,
      answered_at: i.answered_at,
      subject: i.question.subject,
      topic: i.question.topic,
      subtopic: i.question.subtopic,
      difficulty: i.question.difficulty,
      selected: i.selected,
      correct: i.correct,
      spent_ms: i.spent_ms,
    })),
  );
}
export function parseDataset(value: unknown): AnswerDataset {
  if (
    !value ||
    typeof value !== 'object' ||
    !('as_of' in value) ||
    !('rows' in value) ||
    !Array.isArray(value.rows)
  )
    throw new Error('Histórico inválido. Nenhum indicador foi calculado.');
  const end = timestamp(value.as_of);
  if (value.rows.some((r) => !r || typeof r !== 'object'))
    throw new Error('Histórico inválido.');
  const rows = cleanAnswers(value.rows as AnswerRecord[]);
  if (rows.some((r) => timestamp(r.submitted_at) > end))
    throw new Error('Histórico posterior à data da consulta.');
  return { as_of: value.as_of as string, rows };
}
