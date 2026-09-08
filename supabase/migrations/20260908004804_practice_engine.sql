create schema practice_private;
revoke all on schema practice_private from public,anon,authenticated;
grant usage on schema practice_private to authenticated;
create table practice_private.sessions (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 trilha_id uuid references public.trilhas(id) on delete set null,
 exam_id text not null references public.exams(id),
 mode text not null check(mode in ('study','test')),
 kind text not null check(kind in ('synthetic','official')),
 config jsonb not null,
 started_at timestamptz not null default clock_timestamp(), submitted_at timestamptz,
 position integer not null default 0, revision integer not null default 0
);
create unique index practice_one_active on practice_private.sessions(user_id,trilha_id) where submitted_at is null and trilha_id is not null;
create index practice_sessions_trilha on practice_private.sessions(trilha_id);
create index practice_sessions_exam on practice_private.sessions(exam_id);
create index practice_sessions_user on practice_private.sessions(user_id,started_at desc);
create table practice_private.items (
 session_id uuid not null references practice_private.sessions(id) on delete cascade,
 position integer not null, question_id uuid not null references public.questions(id),
 snapshot jsonb not null, selected text check(selected in ('A','B','C','D','E')),
 correct boolean, guessed boolean not null default false, flagged boolean not null default false,
 spent_ms integer not null default 0 check(spent_ms between 0 and 604800000), answered_at timestamptz,
 primary key(session_id,position), unique(session_id,question_id)
);
create index practice_items_question on practice_private.items(question_id);
create table practice_private.operations (
 session_id uuid not null references practice_private.sessions(id) on delete cascade,
 id uuid not null, payload jsonb not null, correct boolean, created_at timestamptz not null default clock_timestamp(),
 primary key(session_id,id)
);
alter table practice_private.sessions enable row level security;
alter table practice_private.items enable row level security;
alter table practice_private.operations enable row level security;
revoke all on all tables in schema practice_private from public,anon,authenticated;

create function practice_private.snapshot(sid uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare s practice_private.sessions;
begin
 if auth.uid() is null then raise exception 'unauthenticated' using errcode='42501'; end if;
 select * into s from practice_private.sessions where id=sid and user_id=auth.uid() for update;
 if not found then raise exception 'session_not_found' using errcode='42501'; end if;
 return jsonb_build_object('id',s.id,'trilha_id',s.trilha_id,'exam_id',s.exam_id,'mode',s.mode,'kind',s.kind,'config',s.config,
 'started_at',s.started_at,'submitted_at',s.submitted_at,'position',s.position,'revision',s.revision,'server_now',clock_timestamp(),
 'items',(select jsonb_agg(jsonb_build_object('position',i.position,'question_id',i.question_id,
 'question',case when s.submitted_at is not null or (s.mode='study' and i.selected is not null) then i.snapshot else i.snapshot-'correct_answer'-'explanation' end,
 'selected',i.selected,'correct',case when s.submitted_at is not null or (s.mode='study' and i.selected is not null) then i.correct else null end,
 'guessed',i.guessed,'flagged',i.flagged,'spent_ms',i.spent_ms,'answered_at',i.answered_at) order by i.position)
 from practice_private.items i where i.session_id=s.id));
end $$;
revoke all on function practice_private.snapshot(uuid) from public,anon,authenticated;

create function practice_private.api(action text, p jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); s practice_private.sessions; item practice_private.items; oldop jsonb;
 sid uuid; tid uuid; eid text; ids uuid[]; qid uuid; n integer; pos integer; opid uuid; sel text; ms integer; v_guessed boolean; v_flagged boolean;
begin
 if uid is null then raise exception 'unauthenticated' using errcode='42501'; end if;
 if jsonb_typeof(p) is distinct from 'object' then raise exception 'invalid_request' using errcode='22023'; end if;
 if action='list' then
  return (select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'exam_id',x.exam_id,'trilha_id',x.trilha_id,'mode',x.mode,'kind',x.kind,'started_at',x.started_at,'submitted_at',x.submitted_at) order by x.started_at desc),'[]'::jsonb)
   from (select * from practice_private.sessions where user_id=uid order by started_at desc limit 100) x);
 elsif action='catalog' then
  select exam_id into eid from public.trilhas where id=(p->>'trilha_id')::uuid and user_id=uid;
  if not found then raise exception 'trilha_not_found' using errcode='42501'; end if;
  return (select coalesce(jsonb_agg(x),'[]'::jsonb) from (
   select q.payload->'subject' as subject,q.payload->'topic' as topic,q.difficulty,q.year,q.kind,count(*)::int as available
   from public.questions q where q.exam_id=eid group by q.payload->'subject',q.payload->'topic',q.difficulty,q.year,q.kind) x);
 elsif action='start' then
  sid:=(p->>'id')::uuid; tid:=(p->>'trilha_id')::uuid;
  if sid is null or tid is null then raise exception 'invalid_config' using errcode='22023'; end if;
  -- Same user lock order for concurrent start retries.
  perform 1 from public.profiles where id=uid for update;
  select * into s from practice_private.sessions where id=sid;
  if found then
   if s.user_id<>uid then raise exception 'session_not_found' using errcode='42501'; end if;
   if s.config<>p then raise exception 'operation_conflict' using errcode='22023'; end if;
   return practice_private.snapshot(sid);
  end if;
  select exam_id into eid from public.trilhas where id=tid and user_id=uid;
  if not found then raise exception 'trilha_not_found' using errcode='42501'; end if;
  select * into s from practice_private.sessions where user_id=uid and trilha_id=tid and submitted_at is null;
  if found then return practice_private.snapshot(s.id); end if;
  if coalesce(p->>'mode','') not in ('study','test') or coalesce(p->>'kind','') not in ('synthetic','official')
   or coalesce(p->>'type','') not in ('subject','topic','custom')
   or coalesce(p->>'count','') !~ '^[0-9]+$' then raise exception 'invalid_config' using errcode='22023'; end if;
  n:=(p->>'count')::int;
  if n not between 1 and 100 or (p->>'type' in ('subject','topic') and coalesce(p->>'subject','')='')
   or (p->>'type'='topic' and coalesce(p->>'topic','')='') then raise exception 'invalid_config' using errcode='22023'; end if;
  select array_agg(id) into ids from (select q.id from public.questions q where q.exam_id=eid and q.kind=p->>'kind'
   and (coalesce(p->>'subject','')='' or q.payload->'subject'->>'key'=p->>'subject')
   and (coalesce(p->>'topic','')='' or q.payload->'topic'->>'key'=p->>'topic')
   and (coalesce(p->>'difficulty','')='' or q.difficulty=p->>'difficulty')
   and (coalesce(p->>'year','')='' or q.year::text=p->>'year') order by random() limit n) chosen;
  if coalesce(cardinality(ids),0)<>n then raise exception 'insufficient_questions' using errcode='22023'; end if;
  insert into practice_private.sessions(id,user_id,trilha_id,exam_id,mode,kind,config) values(sid,uid,tid,eid,p->>'mode',p->>'kind',p);
  pos:=0;
  foreach qid in array ids loop
   insert into practice_private.items(session_id,position,question_id,snapshot) select sid,pos,q.id,q.payload from public.questions q where q.id=qid;
   pos:=pos+1;
  end loop;
  return practice_private.snapshot(sid);
 end if;
 sid:=(p->>'session_id')::uuid;
 select * into s from practice_private.sessions where id=sid and user_id=uid for update;
 if not found then raise exception 'session_not_found' using errcode='42501'; end if;
 if action='read' then return practice_private.snapshot(sid); end if;
 if action not in ('save','submit') then raise exception 'invalid_action' using errcode='22023'; end if;
 opid:=(p->>'operation_id')::uuid;
 if opid is null then raise exception 'invalid_operation' using errcode='22023'; end if;
 select payload into oldop from practice_private.operations where session_id=sid and id=opid;
 if found then
  if oldop<>p then raise exception 'operation_conflict' using errcode='22023'; end if;
  return practice_private.snapshot(sid);
 end if;
 if action='submit' and s.submitted_at is not null then return practice_private.snapshot(sid); end if;
 if s.submitted_at is not null then raise exception 'session_closed' using errcode='22023'; end if;
 if (p->>'revision')::int is distinct from s.revision then raise exception 'revision_conflict' using errcode='40001'; end if;
 if action='submit' then
  update practice_private.sessions set submitted_at=clock_timestamp(),revision=revision+1 where id=sid;
  insert into practice_private.operations(session_id,id,payload) values(sid,opid,p);
  return practice_private.snapshot(sid);
 end if;
 pos:=(p->>'position')::int; sel:=p->>'selected'; ms:=(p->>'spent_ms')::int;
 if pos is null or ms is null or ms not between 0 and 604800000 or (sel is not null and sel not in ('A','B','C','D','E'))
  or jsonb_typeof(p->'guessed') is distinct from 'boolean' or jsonb_typeof(p->'flagged') is distinct from 'boolean'
  or not(p ? 'selected') then raise exception 'invalid_answer' using errcode='22023'; end if;
 v_guessed:=(p->>'guessed')::boolean; v_flagged:=(p->>'flagged')::boolean;
 select * into item from practice_private.items where session_id=sid and position=pos;
 if not found then raise exception 'invalid_question' using errcode='22023'; end if;
 if s.mode='study' and item.selected is not null and item.selected is distinct from sel then raise exception 'study_answer_locked' using errcode='22023'; end if;
 if (p->>'next_position')::int is null or not exists(select 1 from practice_private.items where session_id=sid and position=(p->>'next_position')::int) then raise exception 'invalid_question' using errcode='22023'; end if;
 update practice_private.items set selected=sel,correct=case when sel is null then null else sel=snapshot->>'correct_answer' end,
 guessed=v_guessed,flagged=v_flagged,spent_ms=greatest(items.spent_ms,ms),
 answered_at=case when sel is null then null when sel is distinct from item.selected then clock_timestamp() else item.answered_at end
 where session_id=sid and position=pos;
 update practice_private.sessions set revision=revision+1,position=(p->>'next_position')::int where id=sid;
 insert into practice_private.operations(session_id,id,payload,correct) values(sid,opid,p,case when sel is null then null else sel=item.snapshot->>'correct_answer' end);
 return practice_private.snapshot(sid);
end $$;
revoke all on function practice_private.api(text,jsonb) from public,anon,authenticated;
grant execute on function practice_private.api(text,jsonb) to authenticated;
create function public.practice(action text,payload jsonb) returns jsonb language sql security invoker set search_path='' as $$ select practice_private.api(action,payload); $$;
revoke all on function public.practice(text,jsonb) from public,anon,authenticated;
grant execute on function public.practice(text,jsonb) to authenticated;

-- Some hosted projects include this event-trigger helper in public by default.
-- It has no application RPC use and needs no client EXECUTE grant.
do $$ begin
 if to_regprocedure('public.rls_auto_enable()') is not null then
  revoke all on function public.rls_auto_enable() from public,anon,authenticated;
 end if;
end $$;
