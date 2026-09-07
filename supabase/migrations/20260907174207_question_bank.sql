-- Internal editorial access. No student-facing answer access in Phase 3.
create table public.question_editors (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.question_editors enable row level security;
revoke all on public.question_editors from anon, authenticated;
grant select on public.question_editors to authenticated;
create policy editor_self on public.question_editors for select to authenticated using (user_id = (select auth.uid()));

create table public.question_subjects (
 id uuid primary key default gen_random_uuid(), key text not null unique check(key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
 name text not null check(length(btrim(name)) between 1 and 20000)
);
create table public.question_topics (
 id uuid primary key default gen_random_uuid(), subject_id uuid not null references public.question_subjects(id),
 key text not null check(key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), name text not null check(length(btrim(name)) between 1 and 20000), unique(subject_id,key)
);
create table public.question_subtopics (
 id uuid primary key default gen_random_uuid(), topic_id uuid not null references public.question_topics(id),
 key text not null check(key ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), name text not null check(length(btrim(name)) between 1 and 20000), unique(topic_id,key)
);

create function public.valid_question(q jsonb) returns boolean language plpgsql immutable security invoker set search_path='' as $$
declare k text; m jsonb;
begin
 if jsonb_typeof(q) is distinct from 'object' or (select count(*) from jsonb_object_keys(q)) <> 16 then return false; end if;
 foreach k in array array['id','exam','phase','statement','explanation','difficulty','type','kind','correct_answer'] loop
  if jsonb_typeof(q->k) is distinct from 'string' or length(btrim(q->>k)) not between 1 and 20000 then return false; end if;
 end loop;
 if q->>'id' !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
 or q->>'exam' !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
 or jsonb_typeof(q->'year') is distinct from 'number' or q->>'year' !~ '^[0-9]{4}$' or (q->>'year')::int not between 1900 and 2100
 or q->>'difficulty' not in ('easy','medium','hard') or q->>'type' <> 'multiple_choice'
 or q->>'kind' not in ('synthetic','official') or q->>'correct_answer' not in ('A','B','C','D','E') then return false; end if;
 foreach k in array array['subject','topic','subtopic'] loop
  if jsonb_typeof(q->k) is distinct from 'object' or (select count(*) from jsonb_object_keys(q->k)) <> 2
  or jsonb_typeof(q->k->'key') is distinct from 'string' or q->k->>'key' !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  or jsonb_typeof(q->k->'name') is distinct from 'string' or length(btrim(q->k->>'name')) not between 1 and 20000 then return false; end if;
 end loop;
 if jsonb_typeof(q->'alternatives') is distinct from 'object' or (select count(*) from jsonb_object_keys(q->'alternatives')) <> 5 then return false; end if;
 foreach k in array array['A','B','C','D','E'] loop
  if jsonb_typeof(q->'alternatives'->k) is distinct from 'string' or length(btrim(q->'alternatives'->>k)) not between 1 and 20000 then return false; end if;
 end loop;
 if jsonb_typeof(q->'source') is distinct from 'object' then return false; end if;
 foreach k in array array['title','permission'] loop
  if jsonb_typeof(q->'source'->k) is distinct from 'string' or length(btrim(q->'source'->>k)) not between 1 and 20000 then return false; end if;
 end loop;
 if not (q->'source' ? 'url') or not (q->'source'->'url' = 'null'::jsonb or (jsonb_typeof(q->'source'->'url')='string' and q->'source'->>'url' ~ '^https://[^/@[:space:]]+[^[:space:]]*$')) then return false; end if;
 if q->>'kind'='official' and q->'source'->'url' = 'null'::jsonb then return false; end if;
 if jsonb_typeof(q->'images') is distinct from 'array' or jsonb_array_length(q->'images') > 10 then return false; end if;
 for m in select value from jsonb_array_elements(q->'images') loop
  if jsonb_typeof(m) is distinct from 'object' or jsonb_typeof(m->'alt') is distinct from 'string' or length(btrim(m->>'alt')) not between 1 and 20000
  or jsonb_typeof(m->'url') is distinct from 'string' or not (m->>'url' ~ '^https://[^/@[:space:]]+[^[:space:]]*$' or m->>'url' ~ '^/question-media/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp|svg)$') then return false; end if;
 end loop;
 return true;
exception when others then return false;
end $$;
revoke all on function public.valid_question(jsonb) from public, anon;
grant execute on function public.valid_question(jsonb) to authenticated;

create table public.questions (
 id uuid primary key,
 exam_id text not null references public.exams(id),
 subtopic_id uuid not null references public.question_subtopics(id),
 payload jsonb not null check(public.valid_question(payload)),
 year integer generated always as ((payload->>'year')::integer) stored,
 kind text generated always as (payload->>'kind') stored,
 difficulty text generated always as (payload->>'difficulty') stored,
 fingerprint text generated always as (md5(lower(regexp_replace(btrim(payload->>'statement'),'\s+',' ','g')))) stored,
 created_at timestamptz not null default now(),
 check(id=(payload->>'id')::uuid and exam_id=payload->>'exam'),
 unique(exam_id,fingerprint)
);
create index questions_subtopic on public.questions(subtopic_id);
create index questions_browser on public.questions(exam_id,kind,difficulty,created_at,id);

do $$ declare t text; begin
 foreach t in array array['question_subjects','question_topics','question_subtopics','questions'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select, insert on public.%I to authenticated',t);
  execute format('create policy editor_read on public.%I for select to authenticated using (exists(select 1 from public.question_editors where user_id=(select auth.uid())))',t);
  execute format('create policy editor_insert on public.%I for insert to authenticated with check (exists(select 1 from public.question_editors where user_id=(select auth.uid())))',t);
 end loop;
end $$;

-- Consistency is enforced even when an editor inserts directly through the Data API.
create function public.check_question_taxonomy() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if not exists(select 1 from public.question_subtopics st join public.question_topics t on t.id=st.topic_id join public.question_subjects s on s.id=t.subject_id
 where st.id=new.subtopic_id and new.payload->'subject'=jsonb_build_object('key',s.key,'name',s.name)
 and new.payload->'topic'=jsonb_build_object('key',t.key,'name',t.name)
 and new.payload->'subtopic'=jsonb_build_object('key',st.key,'name',st.name)) then raise exception 'taxonomy_mismatch'; end if;
 return new;
end $$;
revoke all on function public.check_question_taxonomy() from public,anon;
grant execute on function public.check_question_taxonomy() to authenticated;
create trigger question_taxonomy before insert or update on public.questions for each row execute function public.check_question_taxonomy();

create function public.import_questions(batch jsonb) returns integer language plpgsql security invoker set search_path='' as $$
declare q jsonb; sid uuid; tid uuid; stid uuid; existing jsonb; inserted integer:=0; i integer:=0;
begin
 if not exists(select 1 from public.question_editors where user_id=auth.uid()) then raise exception 'editor_required' using errcode='42501'; end if;
 if jsonb_typeof(batch) is distinct from 'array' or jsonb_array_length(batch) not between 1 and 500 or octet_length(batch::text)>5242880 then raise exception 'invalid_batch' using errcode='22023'; end if;
 if (select count(distinct value->>'id') from jsonb_array_elements(batch)) <> jsonb_array_length(batch) then raise exception 'duplicate_id' using errcode='22023'; end if;
 -- Serialize imports; unique constraints still protect direct insert races.
 perform pg_advisory_xact_lock(3048303);
 for q in select value from jsonb_array_elements(batch) loop
  i:=i+1;
  if not public.valid_question(q) then raise exception 'question_%: invalid_fields',i using errcode='22023'; end if;
  select payload into existing from public.questions where id=(q->>'id')::uuid;
  if found then
   if existing=q then continue; else raise exception 'question_%: id_content_conflict',i using errcode='22023'; end if;
  end if;
  insert into public.question_subjects(key,name) values(q->'subject'->>'key',q->'subject'->>'name') on conflict do nothing;
  select id into sid from public.question_subjects where key=q->'subject'->>'key' and name=q->'subject'->>'name';
  if sid is null then raise exception 'question_%: subject_label_conflict',i using errcode='22023'; end if;
  insert into public.question_topics(subject_id,key,name) values(sid,q->'topic'->>'key',q->'topic'->>'name') on conflict do nothing;
  select id into tid from public.question_topics where subject_id=sid and key=q->'topic'->>'key' and name=q->'topic'->>'name';
  if tid is null then raise exception 'question_%: topic_label_conflict',i using errcode='22023'; end if;
  insert into public.question_subtopics(topic_id,key,name) values(tid,q->'subtopic'->>'key',q->'subtopic'->>'name') on conflict do nothing;
  select id into stid from public.question_subtopics where topic_id=tid and key=q->'subtopic'->>'key' and name=q->'subtopic'->>'name';
  if stid is null then raise exception 'question_%: subtopic_label_conflict',i using errcode='22023'; end if;
  insert into public.questions(id,exam_id,subtopic_id,payload) values((q->>'id')::uuid,q->>'exam',stid,q);
  inserted:=inserted+1;
 end loop;
 return inserted;
end $$;
revoke all on function public.import_questions(jsonb) from public,anon;
grant execute on function public.import_questions(jsonb) to authenticated;

-- Reject alternate keys for the same normalized editorial label.
create unique index question_subject_name on public.question_subjects(lower(regexp_replace(btrim(name),'\s+',' ','g')));
create unique index question_topic_name on public.question_topics(subject_id,lower(regexp_replace(btrim(name),'\s+',' ','g')));
create unique index question_subtopic_name on public.question_subtopics(topic_id,lower(regexp_replace(btrim(name),'\s+',' ','g')));
