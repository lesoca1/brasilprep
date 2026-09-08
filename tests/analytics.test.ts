import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  totalAccuracy,
  accuracyBy,
  cleanAnswers,
  recentPerformance,
  historicalPerformance,
  parseDataset,
  type AnswerRecord,
} from '../src/analytics/performance';
function row(i: number, patch: Partial<AnswerRecord> = {}): AnswerRecord {
  return {
    session_id: 's1',
    position: i,
    question_id: `q${i}`,
    exam_id: 'fuvest',
    mode: 'test',
    kind: 'synthetic',
    submitted_at: '2026-09-08T12:00:00Z',
    answered_at: '2026-09-08T11:00:00Z',
    subject: { key: 'math', name: 'Matemática' },
    topic: { key: 'algebra', name: 'Álgebra' },
    subtopic: { key: 'linear', name: 'Linear' },
    difficulty: 'medium',
    selected: 'A',
    correct: true,
    spent_ms: 1000,
    ...patch,
  };
}
test('exact counts, blank denominator, weighted aggregation and average include zero', () => {
  const rows = [
    row(0),
    row(1, { correct: false, spent_ms: 2000 }),
    row(2, { selected: null, correct: null, answered_at: null, spent_ms: 0 }),
  ];
  assert.deepEqual(totalAccuracy(rows), {
    total: 3,
    answered: 2,
    correct: 1,
    incorrect: 1,
    blank: 1,
    accuracy: 100 / 3,
    averageTimeMs: 1000,
    uniqueQuestions: 3,
    uniqueAnswered: 2,
    sessions: 1,
    smallSample: true,
  });
  const more = Array.from({ length: 9 }, (_, i) =>
    row(i, { session_id: 's2', correct: false }),
  );
  assert.equal(totalAccuracy([row(0), ...more]).accuracy, 10);
  assert.deepEqual(totalAccuracy([...rows].reverse()), totalAccuracy(rows));
});
test('empty, all blank and 1/1 do not imply mastery; repetition preserves distinct sample', () => {
  assert.equal(totalAccuracy([]).accuracy, null);
  assert.equal(totalAccuracy([]).averageTimeMs, null);
  assert.equal(
    totalAccuracy([
      row(0, { selected: null, correct: null, answered_at: null }),
    ]).accuracy,
    0,
  );
  assert.equal(totalAccuracy([row(0)]).smallSample, true);
  const repeats = Array.from({ length: 100 }, (_, i) =>
    row(0, { session_id: `s${i}` }),
  );
  assert.equal(totalAccuracy(repeats).answered, 100);
  assert.equal(totalAccuracy(repeats).uniqueAnswered, 1);
  assert.equal(totalAccuracy(repeats).smallSample, true);
  assert.equal(
    totalAccuracy(Array.from({ length: 20 }, (_, i) => row(i))).smallSample,
    false,
  );
});
test('duplicate replay counted once, conflicts and corrupted records rejected', () => {
  assert.equal(totalAccuracy([row(0), row(0)]).total, 1);
  assert.throws(() => cleanAnswers([row(0), row(0, { correct: false })]));
  assert.throws(() => cleanAnswers([row(0), row(1, { question_id: 'q0' })]));
  for (const patch of [
    { correct: null },
    { spent_ms: -1 },
    { spent_ms: NaN },
    { spent_ms: 1.5 },
    { answered_at: null },
    { answered_at: '2026-09-09T00:00:00Z' },
    { subject: { key: '', name: 'M' } },
    { submitted_at: 'invalid' },
    { selected: null },
  ])
    assert.throws(() => totalAccuracy([row(0, patch)]));
  assert.throws(() =>
    parseDataset({ as_of: '2026-09-07T00:00:00Z', rows: [row(0)] }),
  );
  assert.throws(() =>
    parseDataset({ as_of: '2026-09-08T12:00:00Z', rows: [null] }),
  );
  assert.equal(totalAccuracy([row(0, { submitted_at: null })]).total, 0);
});
test('all dimensions retain exam, mode, origin and taxonomy ancestry', () => {
  const rows = [
    row(0),
    row(1, {
      correct: false,
      difficulty: 'hard',
      topic: { key: 'geometry', name: 'Geometria' },
    }),
    row(0, { session_id: 's2', exam_id: 'enem' }),
  ];
  for (const dimension of [
    'exam',
    'subject',
    'topic',
    'subtopic',
    'difficulty',
  ] as const) {
    const groups = accuracyBy(rows, dimension);
    assert.equal(
      groups.reduce((n, g) => n + g.metrics.total, 0),
      3,
    );
    assert.ok(groups.length >= 2);
  }
  assert.equal(
    accuracyBy(rows, 'exam').find((g) => g.label === 'FUVEST')?.metrics
      .accuracy,
    50,
  );
  assert.equal(accuracyBy(rows, 'subtopic').length, 3);
  for (const patch of [
    { exam_id: 'enem' },
    { mode: 'study' as const },
    { kind: 'official' as const },
  ]) {
    const mixed = [row(0), row(0, { session_id: 's2', ...patch })];
    assert.throws(() => totalAccuracy(mixed));
    assert.throws(() => historicalPerformance(mixed));
    assert.throws(() => recentPerformance(mixed, '2026-09-08T12:00:00Z'));
    assert.equal(accuracyBy(mixed, 'subject').length, 2);
  }
});
test('recent exact boundaries, no overlap, excludes future; monthly São Paulo boundary', () => {
  const asOf = '2026-09-08T12:00:00Z',
    end = Date.parse(asOf),
    day = 86400000;
  const rows = [0, 30, 30 + 1 / day, 60, 61, -1].map((days, i) => {
    const date = new Date(end - days * day).toISOString();
    return row(0, {
      session_id: `s${i}`,
      submitted_at: date,
      answered_at: date,
    });
  });
  const recent = recentPerformance(rows, asOf);
  assert.equal(recent.current.total, 2);
  assert.equal(recent.previous.total, 2);
  const monthly = [
    '2026-08-01T02:59:59Z',
    '2026-08-01T03:00:00Z',
    '2026-10-01T03:00:00Z',
  ].map((date, i) =>
    row(0, { session_id: `s${i}`, submitted_at: date, answered_at: date }),
  );
  assert.deepEqual(
    historicalPerformance(monthly).map((g) => [g.key, g.metrics.total]),
    [
      ['2026-07', 1],
      ['2026-08', 1],
      ['2026-10', 1],
    ],
  );
});
