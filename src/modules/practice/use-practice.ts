'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PracticeRepository } from '@/data-access/practice';
import { PracticeError } from '@/data-access/practice';
import type {
  PendingPractice,
  PracticeSession,
  PracticeSummary,
} from '@/domain/practice';
import {
  clearPending,
  pendingKey,
  readPending,
  savePending,
} from '@/lib/practice-storage';
export function usePractice(repository: PracticeRepository, uid: string) {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [sessions, setSessions] = useState<PracticeSummary[]>([]);
  const [pending, setPending] = useState<PendingPractice | null>(null);
  const [busy, setBusy] = useState(true);
  const busyRef = useRef(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const mounted = useRef(true);
  const accept = useCallback((s: PracticeSession) => {
    if (!mounted.current) return;
    setSession(s);
    const url = new URL(window.location.href);
    url.searchParams.set('session', s.id);
    window.history.replaceState(null, '', url);
  }, []);
  const sync = useCallback(
    async (op?: PendingPractice) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      setError('');
      setConflict(false);
      try {
        if (!navigator.locks)
          throw new Error(
            'Este navegador não oferece o bloqueio necessário para salvar com segurança. Use uma versão atual do Chrome, Edge ou Firefox.',
          );
        let performed = false;
        await navigator.locks.request(pendingKey(uid), async () => {
          const task = op ?? readPending(localStorage, uid);
          if (!task) return;
          performed = true;
          savePending(localStorage, uid, task);
          if (mounted.current) setPending(task);
          const s = await repository.perform(task);
          clearPending(localStorage, uid, task);
          if (mounted.current) {
            setPending(null);
            accept(s);
          }
        });
        const list = await repository.list();
        if (!performed) {
          const id = new URL(window.location.href).searchParams.get('session');
          if (id) accept(await repository.read(id));
        }
        if (mounted.current) setSessions(list);
      } catch (e) {
        if (mounted.current) {
          setError(e instanceof Error ? e.message : 'Falha ao salvar.');
          setConflict(
            e instanceof PracticeError &&
              [
                'revision_conflict',
                'session_closed',
                'operation_conflict',
                'insufficient_questions',
                'invalid_config',
                'trilha_not_found',
              ].includes(e.code),
          );
        }
      } finally {
        busyRef.current = false;
        if (mounted.current) setBusy(false);
      }
    },
    [uid, repository, accept],
  );
  const resume = useCallback(
    async (id: string) => {
      if (busyRef.current) return;
      setBusy(true);
      setError('');
      busyRef.current = true;
      try {
        if (readPending(localStorage, uid))
          throw new Error(
            'Sincronize a alteração pendente antes de abrir outra sessão.',
          );
        accept(await repository.read(id));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Falha ao abrir a sessão.');
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [uid, repository, accept],
  );
  useEffect(() => {
    mounted.current = true;
    void (async () => {
      try {
        const queued = readPending(localStorage, uid);
        if (queued) {
          setPending(queued);
          await sync();
          return;
        }
        const list = await repository.list();
        if (!mounted.current) return;
        setSessions(list);
        const id = new URL(window.location.href).searchParams.get('session');
        if (id) accept(await repository.read(id));
      } catch (e) {
        if (mounted.current)
          setError(
            e instanceof Error
              ? e.message
              : 'Não foi possível carregar as sessões.',
          );
      } finally {
        if (mounted.current) setBusy(false);
      }
    })();
    const online = () => {
      void sync();
    };
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (readPending(localStorage, uid)) {
        e.preventDefault();
      }
    };
    const storageChanged = (event: StorageEvent) => {
      if (event.key !== pendingKey(uid)) return;
      try {
        const queued = readPending(localStorage, uid);
        setPending(queued);
        if (!queued && !busyRef.current) {
          const id = new URL(window.location.href).searchParams.get('session');
          if (id)
            void repository
              .read(id)
              .then(accept)
              .catch((e) =>
                setError(
                  e instanceof Error ? e.message : 'Falha ao atualizar sessão.',
                ),
              );
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Falha ao ler salvamento local.',
        );
      }
    };
    window.addEventListener('storage', storageChanged);
    window.addEventListener('online', online);
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      mounted.current = false;
      window.removeEventListener('storage', storageChanged);
      window.removeEventListener('online', online);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [uid, repository, sync, accept]);
  async function discard() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await navigator.locks.request(pendingKey(uid), () => {
        const op = readPending(localStorage, uid);
        if (JSON.stringify(op) !== JSON.stringify(pending))
          throw new Error(
            'A operação pendente mudou em outra aba. Confira o estado antes de descartá-la.',
          );
        if (op) clearPending(localStorage, uid, op);
      });
      setPending(null);
      setConflict(false);
      setError('');
      if (session) accept(await repository.read(session.id));
      else {
        const id =
          pending?.action === 'start' ? null : pending?.payload.session_id;
        if (id) accept(await repository.read(id));
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Não foi possível recuperar a sessão.',
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }
  function close() {
    if (busy || pending) return;
    setSession(null);
    const u = new URL(window.location.href);
    u.searchParams.delete('session');
    window.history.replaceState(null, '', u);
  }
  return {
    session,
    sessions,
    pending,
    busy,
    error,
    conflict,
    sync,
    resume,
    discard,
    close,
  };
}
