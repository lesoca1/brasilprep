-- One SQL snapshot and one JSON value: no silent PostgREST row-limit truncation.
create index practice_finalized_history on practice_private.sessions(user_id,submitted_at,id) where submitted_at is not null;
create function practice_private.analytics() returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'unauthenticated' using errcode='42501'; end if;
 return (select jsonb_build_object('as_of',statement_timestamp(),'rows',coalesce(jsonb_agg(jsonb_build_object(
  'session_id',s.id,'position',i.position,'question_id',i.question_id,'exam_id',s.exam_id,'mode',s.mode,'kind',s.kind,
  'submitted_at',s.submitted_at,'answered_at',i.answered_at,'subject',i.snapshot->'subject','topic',i.snapshot->'topic','subtopic',i.snapshot->'subtopic',
  'difficulty',i.snapshot->>'difficulty','selected',i.selected,'correct',i.correct,'spent_ms',i.spent_ms
 ) order by s.submitted_at,s.id,i.position),'[]'::jsonb))
 from practice_private.sessions s join practice_private.items i on i.session_id=s.id
 where s.user_id=auth.uid() and s.submitted_at is not null and s.submitted_at<=statement_timestamp());
end $$;
revoke all on function practice_private.analytics() from public,anon,authenticated;
grant execute on function practice_private.analytics() to authenticated;
create function public.performance_answers() returns jsonb language sql security invoker set search_path='' as $$ select practice_private.analytics(); $$;
revoke all on function public.performance_answers() from public,anon,authenticated;
grant execute on function public.performance_answers() to authenticated;
