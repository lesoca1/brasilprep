import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import {
  validateQuestionBatch,
  safeMediaUrl,
  type QuestionInput,
} from '../src/domain/questions';
const fixture: QuestionInput[] = JSON.parse(
  readFileSync('public/question-import.synthetic.json', 'utf8'),
);
test('JSON validates synthetic fixture and rejects malformed required fields, duplicates and unsafe media', () => {
  assert.deepEqual(validateQuestionBatch(fixture).errors, []);
  for (const patch of [
    { year: 2026.5 },
    { correct_answer: 'F' },
    { statement: ' ' },
    { type: 'essay' },
    { subject: { key: 'Matemática', name: 'Matemática' } },
    { source: { title: 'x', url: null, permission: '' } },
    { kind: 'official' },
    { alternatives: { A: 'a' } },
    { images: [{ url: 'javascript:alert(1)', alt: 'x' }] },
    { images: [{ url: 'https://example.com/x.png', alt: '' }] },
    { unknown: true },
  ])
    assert.ok(
      validateQuestionBatch([{ ...fixture[0], ...patch }]).errors.length,
    );
  assert.ok(validateQuestionBatch([fixture[0], fixture[0]]).errors.length);
  assert.equal(safeMediaUrl('//evil.com/image.png'), false);
  assert.equal(safeMediaUrl('/question-media/../secret.png'), false);
  assert.ok(readFileSync('public' + fixture[0].images[0].url).length);
});
test('actual migrations enforce atomic imports, taxonomy, stable IDs and editor-only access', async () => {
  const db = new PGlite();
  const editor = '10000000-0000-4000-8000-000000000001';
  const student = '10000000-0000-4000-8000-000000000002';
  try {
    await db.exec(`create role anon;create role authenticated;create schema auth;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to authenticated,anon;grant execute on function auth.uid() to authenticated,anon;`);
    for (const file of readdirSync('supabase/migrations').sort())
      await db.exec(readFileSync('supabase/migrations/' + file, 'utf8'));
    await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
    await db.query('insert into auth.users(id) values($1),($2)', [
      editor,
      student,
    ]);
    await db.query('insert into public.question_editors values($1)', [editor]);
    async function as(uid: string) {
      await db.exec('reset role');
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        uid,
      ]);
      await db.exec('set role authenticated');
    }
    async function run(batch: unknown) {
      return db.query<{ n: number }>(
        'select public.import_questions($1::jsonb) as n',
        [JSON.stringify(batch)],
      );
    }
    await as(student);
    assert.equal(
      (await db.query('select * from public.questions')).rows.length,
      0,
    );
    await assert.rejects(run(fixture), /editor_required/);
    await assert.rejects(
      db.query('insert into public.question_editors values($1)', [student]),
      /permission denied/,
    );
    await as(editor);
    // Any invalid record rolls back taxonomy AND earlier questions.
    await assert.rejects(
      run([fixture[0], { ...fixture[1], correct_answer: 'Z' }]),
      /invalid_fields/,
    );
    assert.equal(
      (await db.query('select * from public.questions')).rows.length,
      0,
    );
    assert.equal(
      (await db.query('select * from public.question_subjects')).rows.length,
      0,
    );
    assert.equal((await run(fixture)).rows[0].n, 2);
    assert.equal((await run(fixture)).rows[0].n, 0);
    assert.deepEqual(
      (
        await db.query<{ id: string }>(
          'select id from public.questions order by id',
        )
      ).rows.map((r) => r.id),
      fixture.map((q) => q.id),
    );
    for (const table of [
      'question_subjects',
      'question_topics',
      'question_subtopics',
    ])
      assert.equal(
        (await db.query('select * from public.' + table)).rows.length,
        1,
      );
    await assert.rejects(
      run([{ ...fixture[0], explanation: 'Alteração silenciosa' }]),
      /id_content_conflict/,
    );
    await assert.rejects(
      run([
        {
          ...fixture[0],
          id: '30000000-0000-4000-8000-000000000003',
          statement: ' ' + fixture[0].statement.toUpperCase() + '  ',
        },
      ]),
      /unique constraint/,
    );
    await assert.rejects(
      run([
        {
          ...fixture[1],
          id: '30000000-0000-4000-8000-000000000004',
          statement: 'Outra questão',
          topic: { ...fixture[1].topic, name: 'Outro rótulo' },
        },
      ]),
      /topic_label_conflict/,
    );
    await assert.rejects(
      run([
        {
          ...fixture[1],
          id: '30000000-0000-4000-8000-000000000004',
          kind: 'official',
        },
      ]),
      /invalid_fields/,
    );
    await assert.rejects(
      run([
        {
          ...fixture[1],
          id: '30000000-0000-4000-8000-000000000004',
          exam: 'unknown',
        },
      ]),
      /foreign key/,
    );
    await assert.rejects(run([fixture[0], fixture[0]]), /duplicate_id/);
    await assert.rejects(
      db.query("update public.questions set payload='{}'"),
      /permission denied/,
    );
    await as(student);
    assert.equal(
      (await db.query('select * from public.questions')).rows.length,
      0,
    );
    await assert.rejects(
      db.query(
        'insert into public.questions(id,exam_id,subtopic_id,payload) select $1, $2, $3, $4::jsonb',
        [fixture[0].id, 'fuvest', fixture[0].id, JSON.stringify(fixture[0])],
      ),
      /taxonomy_mismatch|row-level security/,
    );
    await db.exec('reset role;set role anon');
    await assert.rejects(
      db.query('select * from public.questions'),
      /permission denied/,
    );
    await assert.rejects(run(fixture), /permission denied/);
    await db.exec('reset role');
    await db.query('delete from public.question_editors where user_id=$1', [
      editor,
    ]);
    await as(editor);
    assert.equal(
      (await db.query('select * from public.questions')).rows.length,
      0,
    );
    await assert.rejects(run(fixture), /editor_required/);
  } finally {
    await db.close();
  }
});
