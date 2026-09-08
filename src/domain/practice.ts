import type { Letter, QuestionInput, Taxon } from './questions';
export type PracticeConfig = {
  id: string;
  trilha_id: string;
  mode: 'study' | 'test';
  kind: 'synthetic' | 'official';
  type: 'subject' | 'topic' | 'custom';
  subject: string;
  topic: string;
  difficulty: string;
  year: string;
  count: number;
};
export type PracticeQuestion = Omit<
  QuestionInput,
  'correct_answer' | 'explanation'
> &
  Partial<Pick<QuestionInput, 'correct_answer' | 'explanation'>>;
export type PracticeItem = {
  position: number;
  question_id: string;
  question: PracticeQuestion;
  selected: Letter | null;
  correct: boolean | null;
  guessed: boolean;
  flagged: boolean;
  spent_ms: number;
  answered_at: string | null;
};
export type PracticeSession = {
  id: string;
  trilha_id: string | null;
  exam_id: string;
  mode: 'study' | 'test';
  kind: 'synthetic' | 'official';
  config: PracticeConfig;
  started_at: string;
  submitted_at: string | null;
  server_now: string;
  position: number;
  revision: number;
  items: PracticeItem[];
};
export type PracticeSummary = Pick<
  PracticeSession,
  | 'id'
  | 'trilha_id'
  | 'exam_id'
  | 'mode'
  | 'kind'
  | 'started_at'
  | 'submitted_at'
>;
export type PracticeCatalog = {
  subject: Taxon;
  topic: Taxon;
  difficulty: string;
  year: number;
  kind: string;
  available: number;
}[];
export type SavePractice = {
  session_id: string;
  operation_id: string;
  revision: number;
  position: number;
  next_position: number;
  selected: Letter | null;
  guessed: boolean;
  flagged: boolean;
  spent_ms: number;
};
export type SubmitPractice = {
  session_id: string;
  operation_id: string;
  revision: number;
};
export type PendingPractice =
  | { action: 'start'; payload: PracticeConfig }
  | { action: 'save'; payload: SavePractice }
  | { action: 'submit'; payload: SubmitPractice };
export function practiceResult(items: PracticeItem[]) {
  const correct = items.filter((i) => i.correct === true).length;
  const blank = items.filter((i) => i.selected === null).length;
  return {
    total: items.length,
    correct,
    blank,
    incorrect: items.length - correct - blank,
    accuracy: items.length ? (100 * correct) / items.length : 0,
  };
}
export function availableQuestions(
  catalog: PracticeCatalog,
  filter: Omit<PracticeConfig, 'id' | 'trilha_id'>,
) {
  return catalog
    .filter(
      (c) =>
        c.kind === filter.kind &&
        (!filter.subject || c.subject.key === filter.subject) &&
        (!filter.topic || c.topic.key === filter.topic) &&
        (!filter.difficulty || c.difficulty === filter.difficulty) &&
        (!filter.year || String(c.year) === filter.year),
    )
    .reduce((sum, c) => sum + c.available, 0);
}
export function formatDuration(ms: number) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 3600)
    .toString()
    .padStart(
      2,
      '0',
    )}:${Math.floor(seconds / 60) % 60 < 10 ? '0' : ''}${Math.floor(seconds / 60) % 60}:${(seconds % 60).toString().padStart(2, '0')}`;
}
