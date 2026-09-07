import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
let db;
const directory = mkdtempSync(join(tmpdir(), 'brasilprep-db-'));
const alice = '10000000-0000-4000-8000-000000000001';
const bob = '10000000-0000-4000-8000-000000000002';
const economics = '00000000-0000-4000-8000-000000000001';
const business = '00000000-0000-4000-8000-000000000002';
const unicamp = '00000000-0000-4000-8000-000000000003';
let fuvestId, unicampId;
async function asUser(uid, query, params = []) {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [uid]);
  await db.exec('set role authenticated');
  return db.query(query, params);
}
before(async () => {
  db = new PGlite(directory);
  // Emulates only Supabase's identity SQL contract, never its auth server.
  await db.exec(`create role anon;create role authenticated;create schema auth;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to authenticated,anon;
 grant execute on function auth.uid() to authenticated,anon;`);
  await db.exec(
    readFileSync('supabase/migrations/202609070001_foundation.sql', 'utf8'),
  );
  await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
  await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
  await db.query(
    'insert into auth.users(id,raw_user_meta_data) values($1,$2),($3,$4)',
    [alice, { display_name: 'Alice' }, bob, { display_name: 'Bob' }],
  );
});
after(async () => {
  await db?.close();
  rmSync(directory, { recursive: true, force: true });
});
test('profile trigger creates one private profile; development seed is idempotent and has no cutoffs', async () => {
  const a = await asUser(alice, 'select * from public.profiles');
  assert.equal(a.rows.length, 1);
  assert.equal(a.rows[0].display_name, 'Alice');
  assert.equal(a.rows[0].active_trilha_id, null);
  const targets = await asUser(alice, 'select * from public.admission_targets');
  assert.equal(targets.rows.length, 8);
  assert.ok(
    targets.rows.every((t) => t.is_development && t.cutoff_score === null),
  );
});
test('onboarding atomically saves multiple exams and completion, and is idempotent', async () => {
  await asUser(alice, 'select public.confirm_trilhas($1::uuid[])', [
    [economics, unicamp],
  ]);
  await asUser(alice, 'select public.confirm_trilhas($1::uuid[])', [
    [economics, unicamp],
  ]);
  const t = await asUser(
    alice,
    'select * from public.trilhas order by exam_id',
  );
  assert.equal(t.rows.length, 2);
  fuvestId = t.rows.find((t) => t.exam_id === 'fuvest').id;
  unicampId = t.rows.find((t) => t.exam_id === 'unicamp').id;
  const p = await asUser(alice, 'select * from public.profiles');
  assert.ok(p.rows[0].onboarding_completed_at);
  assert.ok([fuvestId, unicampId].includes(p.rows[0].active_trilha_id));
});
test('switching persists in the profile and changing target preserves the exam and trilha id', async () => {
  await asUser(alice, 'select public.switch_trilha($1)', [unicampId]);
  assert.equal(
    (await asUser(alice, 'select active_trilha_id from public.profiles'))
      .rows[0].active_trilha_id,
    unicampId,
  );
  await asUser(alice, 'select public.change_trilha_target($1,$2)', [
    fuvestId,
    business,
  ]);
  assert.equal(
    (
      await asUser(alice, 'select target_id from public.trilhas where id=$1', [
        fuvestId,
      ])
    ).rows[0].target_id,
    business,
  );
  await assert.rejects(
    asUser(alice, 'select public.change_trilha_target($1,$2)', [
      fuvestId,
      unicamp,
    ]),
    /invalid_target/,
  );
});
test('onboarding and active selection survive a database restart', async () => {
  await db.close();
  db = new PGlite(directory);
  const p = await asUser(alice, 'select * from public.profiles');
  assert.equal(p.rows[0].active_trilha_id, unicampId);
  assert.equal(
    (await asUser(alice, 'select * from public.trilhas')).rows.length,
    2,
  );
});
test('another user cannot read, switch, edit or remove Alice trilhas', async () => {
  assert.equal(
    (await asUser(bob, 'select * from public.trilhas')).rows.length,
    0,
  );
  assert.equal(
    (await asUser(bob, 'select * from public.profiles where id=$1', [alice]))
      .rows.length,
    0,
  );
  for (const [sql, args] of [
    ['select public.switch_trilha($1)', [fuvestId]],
    ['select public.change_trilha_target($1,$2)', [fuvestId, business]],
    ['select public.remove_trilha($1)', [fuvestId]],
  ])
    await assert.rejects(asUser(bob, sql, args), /trilha_not_found/);
});
test('direct writes cannot bypass mutation functions or assign another owner', async () => {
  await assert.rejects(
    asUser(bob, 'update public.profiles set active_trilha_id=$1 where id=$2', [
      fuvestId,
      bob,
    ]),
    /permission denied/,
  );
  await assert.rejects(
    asUser(
      bob,
      'insert into public.trilhas(user_id,exam_id,target_id) values($1,$2,$3)',
      [alice, 'fuvest', economics],
    ),
    /permission denied/,
  );
  await assert.rejects(
    asUser(bob, "update public.exams set name='Tampered'"),
    /permission denied/,
  );
  await asUser(
    bob,
    "update public.profiles set display_name='New Bob' where id=$1",
    [alice],
  );
  assert.equal(
    (await asUser(alice, 'select display_name from public.profiles')).rows[0]
      .display_name,
    'Alice',
  );
});
test('invalid selections roll back, including duplicate exams, missing targets and empty arrays', async () => {
  for (const ids of [
    [],
    [economics, business],
    [economics, economics],
    ['00000000-0000-4000-8000-000000000099'],
  ])
    await assert.rejects(
      asUser(bob, 'select public.confirm_trilhas($1::uuid[])', [ids]),
      /invalid_selection/,
    );
  assert.equal(
    (await asUser(bob, 'select * from public.trilhas')).rows.length,
    0,
  );
  assert.equal(
    (await asUser(bob, 'select onboarding_completed_at from public.profiles'))
      .rows[0].onboarding_completed_at,
    null,
  );
});
test('inactive targets remain visible to their owners but cannot be newly selected', async () => {
  await db.exec('reset role');
  await db.query(
    'update public.admission_targets set active=false where id=$1',
    [unicamp],
  );
  assert.equal(
    (
      await asUser(
        alice,
        'select id from public.admission_targets where id=$1',
        [unicamp],
      )
    ).rows.length,
    1,
  );
  assert.equal(
    (
      await asUser(bob, 'select id from public.admission_targets where id=$1', [
        unicamp,
      ])
    ).rows.length,
    0,
  );
  await assert.rejects(
    asUser(bob, 'select public.confirm_trilhas($1::uuid[])', [[unicamp]]),
    /invalid_selection/,
  );
});
test('removing the active trilha picks another owned trilha; removing the last clears selection', async () => {
  await asUser(alice, 'select public.remove_trilha($1)', [unicampId]);
  assert.equal(
    (await asUser(alice, 'select active_trilha_id from public.profiles'))
      .rows[0].active_trilha_id,
    fuvestId,
  );
  await asUser(alice, 'select public.remove_trilha($1)', [fuvestId]);
  assert.equal(
    (await asUser(alice, 'select active_trilha_id from public.profiles'))
      .rows[0].active_trilha_id,
    null,
  );
  await asUser(alice, 'select public.confirm_trilhas($1::uuid[])', [
    [economics],
  ]);
  assert.equal(
    (await asUser(alice, 'select * from public.trilhas')).rows.length,
    1,
  );
});
test('anonymous access is denied, including security-definer mutation functions', async () => {
  await db.exec('reset role; set role anon');
  await assert.rejects(
    db.query('select * from public.profiles'),
    /permission denied/,
  );
  await assert.rejects(
    db.query('select public.confirm_trilhas($1::uuid[])', [[economics]]),
    /permission denied/,
  );
  await assert.rejects(
    asUser('', 'select public.confirm_trilhas($1::uuid[])', [[economics]]),
    /unauthenticated/,
  );
});
test('cutoffs require provenance and account deletion cascades to all owned data', async () => {
  await db.exec('reset role');
  await assert.rejects(
    db.query(
      'update public.admission_targets set cutoff_score=76 where id=$1',
      [economics],
    ),
    /check constraint/,
  );
  await assert.rejects(
    db.query(
      "update public.admission_targets set cutoff_score=76,score_scale='points',verified_at=now(),source_url=null where id=$1",
      [economics],
    ),
    /check constraint/,
  );
  await db.query('delete from auth.users where id=$1', [alice]);
  assert.equal(
    (await db.query('select * from public.profiles where id=$1', [alice])).rows
      .length,
    0,
  );
  assert.equal(
    (await db.query('select * from public.trilhas where user_id=$1', [alice]))
      .rows.length,
    0,
  );
});
