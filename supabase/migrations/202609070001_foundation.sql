begin;

create table public.exams (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  name text not null, active boolean not null default true,
  is_development boolean not null default false
);
create table public.institutions (
  id text primary key, name text not null, abbreviation text not null,
  is_development boolean not null default false
);
create table public.courses (
  id text primary key, institution_id text not null references public.institutions(id),
  name text not null, campus text not null, modality text not null,
  is_development boolean not null default false,
  unique(institution_id, name, campus, modality)
);
create table public.admission_targets (
  id uuid primary key default gen_random_uuid(),
  exam_id text not null references public.exams(id),
  course_id text not null references public.courses(id),
  admission_year integer not null check(admission_year between 2000 and 2100),
  competition_category text not null,
  phase text not null,
  cutoff_score numeric,
  score_scale text,
  source_url text,
  verified_at timestamptz,
  active boolean not null default true,
  is_development boolean not null default false,
  unique(id, exam_id),
  unique(exam_id, course_id, admission_year, competition_category, phase),
  check (cutoff_score is null or (cutoff_score >= 0 and score_scale is not null and char_length(trim(score_scale)) > 0 and source_url is not null and source_url ~ '^https://' and verified_at is not null))
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check(char_length(trim(display_name)) between 1 and 80),
  active_trilha_id uuid,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.trilhas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exam_id text not null references public.exams(id),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, exam_id),
  foreign key(target_id, exam_id) references public.admission_targets(id, exam_id)
);
alter table public.profiles add constraint profiles_active_trilha_fk
  foreign key(active_trilha_id) references public.trilhas(id) on delete set null;
create index trilhas_target_idx on public.trilhas(target_id);
create index profiles_active_trilha_idx on public.profiles(active_trilha_id);
create index admission_targets_course_idx on public.admission_targets(course_id);
create index admission_targets_exam_idx on public.admission_targets(exam_id);

create function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger trilhas_updated before update on public.trilhas for each row execute function public.set_updated_at();

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id, display_name) values(new.id, coalesce(nullif(left(trim(new.raw_user_meta_data->>'display_name'),80),''),'Estudante'));
 return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.exams enable row level security;
alter table public.institutions enable row level security;
alter table public.courses enable row level security;
alter table public.admission_targets enable row level security;
alter table public.profiles enable row level security;
alter table public.trilhas enable row level security;

revoke all on public.exams,public.institutions,public.courses,public.admission_targets,public.profiles,public.trilhas from anon,authenticated;
grant select on public.exams,public.institutions,public.courses,public.admission_targets,public.profiles,public.trilhas to authenticated;
grant update(display_name) on public.profiles to authenticated;
create policy exams_read on public.exams for select to authenticated using(active or exists(select 1 from public.trilhas t where t.exam_id=exams.id and t.user_id=(select auth.uid())));
create policy institutions_read on public.institutions for select to authenticated using(true);
create policy courses_read on public.courses for select to authenticated using(true);
create policy targets_read on public.admission_targets for select to authenticated using(active or exists(select 1 from public.trilhas t where t.target_id=admission_targets.id and t.user_id=(select auth.uid())));
create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profiles_edit on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy trilhas_read on public.trilhas for select to authenticated using(user_id=(select auth.uid()));

-- All mutations serialize on the owner's profile. The caller never supplies user_id.
create function public.confirm_trilhas(target_ids uuid[]) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); selected_count integer; exam_count integer;
begin
 if uid is null then raise exception 'unauthenticated' using errcode='28000'; end if;
 perform 1 from public.profiles where id=uid for update;
 if not found then raise exception 'profile_missing'; end if;
 if target_ids is null or cardinality(target_ids) not between 1 and 8 then raise exception 'invalid_selection' using errcode='22023'; end if;
 select count(*), count(distinct t.exam_id) into selected_count,exam_count
 from public.admission_targets t join public.exams e on e.id=t.exam_id
 where t.id=any(target_ids) and t.active and e.active;
 if selected_count<>cardinality(target_ids) or exam_count<>selected_count then raise exception 'invalid_selection' using errcode='22023'; end if;
 insert into public.trilhas(user_id,exam_id,target_id)
 select uid,t.exam_id,t.id from public.admission_targets t where t.id=any(target_ids)
 on conflict(user_id,exam_id) do nothing;
 update public.profiles set
   active_trilha_id=coalesce(active_trilha_id,(select id from public.trilhas where user_id=uid order by created_at,id limit 1)),
   onboarding_completed_at=coalesce(onboarding_completed_at,now()) where id=uid;
end;
$$;
create function public.switch_trilha(trilha_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
 if uid is null then raise exception 'unauthenticated' using errcode='28000'; end if;
 perform 1 from public.profiles where id=uid for update;
 if not exists(select 1 from public.trilhas where id=trilha_id and user_id=uid) then raise exception 'trilha_not_found' using errcode='42501'; end if;
 update public.profiles set active_trilha_id=trilha_id where id=uid;
end;
$$;
create function public.change_trilha_target(trilha_id uuid,new_target_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); selected_exam text;
begin
 if uid is null then raise exception 'unauthenticated' using errcode='28000'; end if;
 perform 1 from public.profiles where id=uid for update;
 select exam_id into selected_exam from public.trilhas where id=trilha_id and user_id=uid;
 if not found then raise exception 'trilha_not_found' using errcode='42501'; end if;
 if not exists(select 1 from public.admission_targets t join public.exams e on e.id=t.exam_id where t.id=new_target_id and t.exam_id=selected_exam and t.active and e.active) then raise exception 'invalid_target' using errcode='22023'; end if;
 update public.trilhas set target_id=new_target_id where id=trilha_id and user_id=uid;
end;
$$;
create function public.remove_trilha(trilha_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
 if uid is null then raise exception 'unauthenticated' using errcode='28000'; end if;
 perform 1 from public.profiles where id=uid for update;
 delete from public.trilhas where id=trilha_id and user_id=uid;
 if not found then raise exception 'trilha_not_found' using errcode='42501'; end if;
 update public.profiles set active_trilha_id=coalesce(active_trilha_id,(select id from public.trilhas where user_id=uid order by created_at,id limit 1)) where id=uid;
end;
$$;
revoke all on function public.handle_new_user(),public.set_updated_at(),public.confirm_trilhas(uuid[]),public.switch_trilha(uuid),public.change_trilha_target(uuid,uuid),public.remove_trilha(uuid) from public,anon,authenticated;
grant execute on function public.confirm_trilhas(uuid[]),public.switch_trilha(uuid),public.change_trilha_target(uuid,uuid),public.remove_trilha(uuid) to authenticated;
commit;
