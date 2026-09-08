import {
  parseDataset,
  totalAccuracy,
  sessionAnswers,
} from '../src/analytics/performance';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import {
  practiceResult,
  formatDuration,
  type PracticeSession,
} from '../src/domain/practice';
test('practice result counts unanswered questions in denominator and timer handles hours', () => {
  const items = [
    { selected: 'A', correct: true },
    { selected: 'B', correct: false },
    { selected: null, correct: null },
  ] as PracticeSession['items'];
  assert.deepEqual(practiceResult(items), {
    total: 3,
    correct: 1,
    incorrect: 1,
    blank: 1,
    accuracy: 100 / 3,
  });
  assert.equal(formatDuration(3661000), '01:01:01');
});
test('complete study/test SQL loop: durable set, hidden feedback, retries, conflicts and isolation', async () => {
  const db = new PGlite();
  const alice = '10000000-0000-4000-8000-000000000001';
  const bob = '10000000-0000-4000-8000-000000000002';
  try {
    await db.exec(
      `create role anon;create role authenticated;create schema auth;create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`,
    );
    for (const f of readdirSync('supabase/migrations').sort())
      await db.exec(readFileSync('supabase/migrations/' + f, 'utf8'));
    await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
    await db.query('insert into auth.users(id) values($1),($2)', [alice, bob]);
    await db.query('insert into public.question_editors values($1)', [alice]);
    async function as(uid: string) {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        uid,
      ]);
      await db.exec('set role authenticated');
    }
    async function api<T = PracticeSession>(action: string, p: unknown) {
      const r = await db.query<{ v: T }>(
        'select public.practice($1,$2::jsonb) as v',
        [action, JSON.stringify(p)],
      );
      return r.rows[0].v;
    }
    async function analytics() {
      const r = await db.query<{ v: unknown }>(
        'select public.performance_answers() as v',
      );
      return parseDataset(r.rows[0].v);
    }
    await as(alice);
    await db.query('select public.import_questions($1::jsonb)', [
      readFileSync('public/question-import.synthetic.json', 'utf8'),
    ]);
    await db.query(
      "select public.confirm_trilhas(array['00000000-0000-4000-8000-000000000001'::uuid])",
    );
    const tid = (
      await db.query<{ id: string }>('select id from public.trilhas')
    ).rows[0].id;
    const config = {
      id: crypto.randomUUID(),
      trilha_id: tid,
      mode: 'test',
      kind: 'synthetic',
      type: 'custom',
      subject: '',
      topic: '',
      difficulty: '',
      year: '',
      count: 2,
    };
    await assert.rejects(
      api('start', { ...config, count: 3 }),
      /insufficient_questions/,
    );
    await assert.rejects(
      api('start', { ...config, kind: 'official' }),
      /insufficient_questions/,
    );
    let session = await api('start', config);
    assert.equal((await analytics()).rows.length, 0);
    const ids = session.items.map((i) => i.question_id);
    assert.equal(session.items.length, 2);
    assert.ok(
      session.items.every(
        (i) =>
          !('correct_answer' in i.question) &&
          !('explanation' in i.question) &&
          i.correct === null,
      ),
    );
    assert.deepEqual(
      (await api('start', config)).items.map((i) => i.question_id),
      ids,
    );
    assert.equal(
      (await api('start', { ...config, id: crypto.randomUUID() })).id,
      session.id,
    );
    // Students must lose editorial access to test direct answer-bank isolation.
    await db.exec('reset role');
    await db.query('delete from public.question_editors where user_id=$1', [
      alice,
    ]);
    await as(alice);
    assert.equal(
      (await db.query('select * from public.questions')).rows.length,
      0,
    );
    await assert.rejects(
      db.query('select * from practice_private.items'),
      /permission denied/,
    );
    const save = {
      session_id: session.id,
      operation_id: crypto.randomUUID(),
      revision: session.revision,
      position: 0,
      next_position: 1,
      selected: 'B',
      guessed: true,
      flagged: true,
      spent_ms: 2500,
    };
    session = await api('save', save);
    assert.equal(session.items[0].selected, 'B');
    assert.equal(session.items[0].spent_ms, 2500);
    assert.equal(session.items[0].guessed, true);
    assert.equal(session.items[0].flagged, true);
    assert.equal(session.items[0].correct, null);
    assert.equal(session.items[0].question.explanation, undefined);
    assert.equal((await api('save', save)).revision, 1);
    await assert.rejects(
      api('save', { ...save, selected: 'A' }),
      /operation_conflict/,
    );
    await assert.rejects(
      api('save', { ...save, operation_id: crypto.randomUUID() }),
      /revision_conflict/,
    );
    session = await api('read', { session_id: session.id });
    assert.equal(session.position, 1);
    assert.deepEqual(
      session.items.map((i) => i.question_id),
      ids,
    );
    assert.equal((await analytics()).rows.length, 0);
    const sid = session.id;
    await as(bob);
    for (const action of ['read', 'save', 'submit'])
      await assert.rejects(
        api(action, {
          ...save,
          operation_id: crypto.randomUUID(),
          session_id: sid,
        }),
        /session_not_found/,
      );
    await assert.rejects(
      api('start', { ...config, id: crypto.randomUUID() }),
      /trilha_not_found/,
    );
    await assert.rejects(
      api('catalog', { trilha_id: tid }),
      /trilha_not_found/,
    );
    await as(alice);
    const submit = {
      session_id: sid,
      operation_id: crypto.randomUUID(),
      revision: session.revision,
    };
    session = await api('submit', submit);
    const persisted = await analytics();
    assert.equal(persisted.rows.length, 2);
    assert.deepEqual(
      totalAccuracy(persisted.rows),
      totalAccuracy(sessionAnswers(session)),
    );
    assert.equal(persisted.rows[0].spent_ms, 2500);
    assert.equal(persisted.rows[1].selected, null);
    assert.ok(
      persisted.rows.every(
        (r) => !('explanation' in r) && !('correct_answer' in r),
      ),
    );
    await as(bob);
    assert.equal((await analytics()).rows.length, 0);
    await as(alice);
    const submittedAt = session.submitted_at;
    assert.ok(submittedAt);
    assert.ok(
      session.items.every(
        (i) => i.question.correct_answer && i.question.explanation,
      ),
    );
    assert.equal((await api('submit', submit)).submitted_at, submittedAt);
    assert.equal(
      (await api('submit', { ...submit, operation_id: crypto.randomUUID() }))
        .submitted_at,
      submittedAt,
    );
    await assert.rejects(
      api('save', {
        ...save,
        operation_id: crypto.randomUUID(),
        revision: session.revision,
      }),
      /session_closed/,
    );
    assert.equal(practiceResult(session.items).blank, 1);
    // Study reveals only the answered question and locks its answer.
    session = await api('start', {
      ...config,
      id: crypto.randomUUID(),
      mode: 'study',
    });
    const study = {
      ...save,
      session_id: session.id,
      operation_id: crypto.randomUUID(),
      revision: 0,
    };
    session = await api('save', study);
    assert.equal((await analytics()).rows.length, 2);
    assert.ok(session.items[0].question.explanation);
    assert.equal(session.items[1].question.explanation, undefined);
    await assert.rejects(
      api('save', {
        ...study,
        operation_id: crypto.randomUUID(),
        revision: 1,
        selected: 'A',
      }),
      /study_answer_locked/,
    );
    await assert.rejects(
      api('save', {
        ...study,
        operation_id: crypto.randomUUID(),
        revision: 1,
        selected: 'F',
      }),
      /invalid_answer/,
    );
    await api('submit', {
      session_id: session.id,
      operation_id: crypto.randomUUID(),
      revision: 1,
    });
    assert.equal((await analytics()).rows.length, 4);
    await db.query('select public.remove_trilha($1)', [tid]);
    assert.equal((await analytics()).rows.length, 4);
    // More than PostgREST's usual row limit still travels as one complete JSON value.
    await db.exec('reset role');
    await db.query(
      `with copies as (
      insert into practice_private.sessions(id,user_id,exam_id,mode,kind,config,submitted_at)
      select gen_random_uuid(),user_id,exam_id,mode,kind,config,submitted_at
      from practice_private.sessions cross join generate_series(1,501) where id=$1 returning id
    ) insert into practice_private.items(session_id,position,question_id,snapshot,selected,correct,spent_ms,answered_at)
      select copies.id,i.position,i.question_id,i.snapshot,i.selected,i.correct,i.spent_ms,i.answered_at
      from copies cross join practice_private.items i where i.session_id=$1`,
      [sid],
    );
    await as(alice);
    const large = await analytics();
    assert.equal(large.rows.length, 1006);
    assert.equal(
      totalAccuracy(large.rows.filter((r) => r.mode === 'test')).total,
      1004,
    );
    await as(bob);
    assert.equal((await analytics()).rows.length, 0);
    await as(alice);
    assert.equal((await api('read', { session_id: sid })).trilha_id, null);
    await db.exec('reset role;set role anon');
    await assert.rejects(api('read', { session_id: sid }), /permission denied/);
    await assert.rejects(analytics(), /permission denied/);
    await as('');
    await assert.rejects(analytics(), /unauthenticated/);
  } finally {
    await db.close();
  }
});

test('durable outbox survives reload, rejects overwrite and clears only the acknowledged operation', async () => {
  const { readPending, savePending, clearPending } =
    await import('../src/lib/practice-storage');
  const map = new Map<string, string>();
  const storage = {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v);
    },
    removeItem: (k: string) => {
      map.delete(k);
    },
  };
  const operation = {
    action: 'submit' as const,
    payload: {
      session_id: crypto.randomUUID(),
      operation_id: crypto.randomUUID(),
      revision: 2,
    },
  };
  savePending(storage, 'alice', operation);
  assert.deepEqual(readPending(storage, 'alice'), operation);
  assert.equal(readPending(storage, 'bob'), null);
  const other = {
    ...operation,
    payload: { ...operation.payload, operation_id: crypto.randomUUID() },
  };
  assert.throws(() => savePending(storage, 'alice', other), /pendente/);
  clearPending(storage, 'alice', other);
  assert.deepEqual(readPending(storage, 'alice'), operation);
  clearPending(storage, 'alice', operation);
  assert.equal(readPending(storage, 'alice'), null);
  assert.throws(
    () =>
      savePending(
        {
          ...storage,
          setItem: () => {
            throw new Error('quota');
          },
        },
        'alice',
        operation,
      ),
    /quota/,
  );
});
