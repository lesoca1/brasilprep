'use client';
import { SessionAnalytics } from '@/modules/performance/metric-report';
import { useEffect, useRef, useState } from 'react';
import { Button, Panel } from '@/components/ui/primitives';
import {
  formatDuration,
  practiceResult,
  type PracticeItem,
  type PracticeSession,
  type PendingPractice,
} from '@/domain/practice';
import { storedTime, timeKey } from '@/lib/practice-storage';
import { PracticeQuestionCard } from './practice-question';
export function PracticeSessionView({
  session,
  uid,
  busy,
  pending,
  onOperation,
  onClose,
}: {
  session: PracticeSession;
  uid: string;
  busy: boolean;
  pending: boolean;
  onOperation: (op: PendingPractice) => void;
  onClose: () => void;
}) {
  const item = session.items[session.position];
  const [elapsed, setElapsed] = useState(0);
  const [spent, setSpent] = useState({
    position: item.position,
    ms: item.spent_ms,
  });
  const [storageError, setStorageError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const heartbeat = useRef(0);
  const saveRef = useRef<() => void>(() => {});
  const offset = useRef(0);
  useEffect(() => {
    offset.current = Date.parse(session.server_now) - Date.now();
  }, [session.server_now]);
  const closed = Boolean(session.submitted_at);
  function save(
    patch: Partial<Pick<PracticeItem, 'selected' | 'guessed' | 'flagged'>> = {},
    next = session.position,
  ) {
    if (busy || pending || closed) return;
    try {
      const ms = storedTime(
        localStorage,
        uid,
        session.id,
        item.position,
        item.spent_ms,
      );
      onOperation({
        action: 'save',
        payload: {
          session_id: session.id,
          operation_id: crypto.randomUUID(),
          revision: session.revision,
          position: item.position,
          next_position: next,
          selected: item.selected,
          guessed: item.guessed,
          flagged: item.flagged,
          spent_ms: ms,
          ...patch,
        },
      });
    } catch {
      setStorageError(
        'Não foi possível acessar o salvamento local. Libere armazenamento neste navegador antes de responder.',
      );
    }
  }
  useEffect(() => {
    saveRef.current = () => save();
  });
  useEffect(() => {
    let previous = Date.now();
    const tick = () => {
      const now = Date.now();
      const delta = Math.min(1500, Math.max(0, now - previous));
      previous = now;
      setElapsed(
        Math.max(
          0,
          (session.submitted_at
            ? Date.parse(session.submitted_at)
            : now + offset.current) - Date.parse(session.started_at),
        ),
      );
      if (
        closed ||
        confirm ||
        busy ||
        pending ||
        document.visibilityState !== 'visible'
      )
        return;
      try {
        const ms = Math.min(
          604800000,
          storedTime(
            localStorage,
            uid,
            session.id,
            item.position,
            item.spent_ms,
          ) + delta,
        );
        localStorage.setItem(
          timeKey(uid, session.id, item.position),
          String(ms),
        );
        setSpent({ position: item.position, ms });
        heartbeat.current += delta;
        if (heartbeat.current >= 15000) {
          heartbeat.current = 0;
          saveRef.current();
        }
      } catch {
        setStorageError(
          'Não foi possível salvar o tempo localmente. Verifique o armazenamento do navegador.',
        );
      }
    };
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [
    session.id,
    session.started_at,
    session.submitted_at,
    item.position,
    item.spent_ms,
    uid,
    closed,
    busy,
    pending,
    confirm,
  ]);
  const result = practiceResult(session.items);
  function submit() {
    if (busy || pending) return;
    onOperation({
      action: 'submit',
      payload: {
        session_id: session.id,
        operation_id: crypto.randomUUID(),
        revision: session.revision,
      },
    });
    setConfirm(false);
  }
  return (
    <>
      <Panel
        title={
          closed
            ? 'Resultado da prática'
            : `Questão ${session.position + 1} de ${session.items.length}`
        }
        subtitle={`${session.exam_id.toUpperCase()} · ${session.mode === 'study' ? 'Estudo' : 'Teste'} · ${session.kind === 'synthetic' ? 'Conteúdo sintético de desenvolvimento' : 'Questões oficiais'}`}
      >
        <div className="practice-toolbar">
          <p>
            Tempo decorrido: <strong>{formatDuration(elapsed)}</strong>
          </p>
          <p>
            {session.items.filter((i) => i.selected !== null).length}/
            {session.items.length} respondidas
          </p>
          <p role="status">
            {busy
              ? 'Salvando…'
              : pending
                ? 'Alteração pendente neste navegador'
                : 'Respostas sincronizadas'}
          </p>
        </div>
        <p className="small muted practice-pad">
          O tempo decorrido inclui pausas e períodos fora da página.
        </p>
        {storageError && <p role="alert">{storageError}</p>}
        {closed ? (
          <>
            <SessionAnalytics session={session} />
            {session.items.map((i) => (
              <details className="question-record" key={i.position}>
                <summary>
                  Questão {i.position + 1}:{' '}
                  {i.selected === null
                    ? 'em branco'
                    : i.correct
                      ? 'correta'
                      : 'incorreta'}{' '}
                  · {formatDuration(i.spent_ms)}
                  {i.guessed ? ' · marcou chute' : ''}
                  {i.flagged ? ' · sinalizada' : ''}
                </summary>
                <PracticeQuestionCard item={i} disabled onAnswer={() => {}} />
              </details>
            ))}
            <div className="practice-pad">
              <Button onClick={onClose}>Voltar às práticas</Button>
            </div>
          </>
        ) : (
          <>
            <nav className="practice-nav" aria-label="Navegar pelas questões">
              {session.items.map((i) => (
                <Button
                  key={i.position}
                  aria-current={
                    session.position === i.position ? 'step' : undefined
                  }
                  disabled={busy || pending}
                  onClick={() => save({}, i.position)}
                  aria-label={`Questão ${i.position + 1}${i.selected ? ', respondida' : ', em branco'}${i.flagged ? ', sinalizada' : ''}`}
                >
                  {i.position + 1}
                  {i.flagged ? ' *' : ''}
                  {i.selected ? ' ·' : ''}
                </Button>
              ))}
            </nav>
            <p className="small muted practice-pad">
              * Sinalizada para revisão. · Respondida.
            </p>
            {session.mode === 'study' && (
              <p className="data-note">
                Ao selecionar uma alternativa, você confirma a resposta e recebe
                a explicação. A resposta não poderá ser alterada.
              </p>
            )}
            <PracticeQuestionCard
              key={item.question_id}
              item={item}
              disabled={
                busy ||
                pending ||
                Boolean(storageError) ||
                (session.mode === 'study' && item.selected !== null)
              }
              onAnswer={(selected) => save({ selected })}
            />
            <div className="practice-toolbar">
              <label>
                <input
                  type="checkbox"
                  checked={item.guessed}
                  disabled={busy || pending}
                  onChange={(e) => save({ guessed: e.target.checked })}
                />{' '}
                Respondi por chute
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={item.flagged}
                  disabled={busy || pending}
                  onChange={(e) => save({ flagged: e.target.checked })}
                />{' '}
                Sinalizar para revisão
              </label>
              <span className="small muted">
                Tempo nesta questão:{' '}
                {formatDuration(
                  Math.max(
                    spent.position === item.position ? spent.ms : 0,
                    item.spent_ms,
                  ),
                )}
              </span>
              {session.mode === 'test' && item.selected && (
                <Button
                  disabled={busy || pending}
                  onClick={() => save({ selected: null })}
                >
                  Limpar resposta
                </Button>
              )}
            </div>
            <div className="practice-toolbar">
              <Button
                disabled={busy || pending || session.position === 0}
                onClick={() => save({}, session.position - 1)}
              >
                Anterior
              </Button>
              <Button
                disabled={
                  busy ||
                  pending ||
                  session.position === session.items.length - 1
                }
                onClick={() => save({}, session.position + 1)}
              >
                Próxima
              </Button>
              <Button
                disabled={busy || pending}
                onClick={() => {
                  save();
                  setConfirm(true);
                }}
              >
                Finalizar sessão
              </Button>
            </div>
            {confirm && (
              <div
                className="practice-confirm"
                role="region"
                aria-label="Confirmar envio"
              >
                <p>
                  Finalizar com {result.blank} questão(ões) em branco e{' '}
                  {session.items.filter((i) => i.flagged).length} sinalizada(s)?
                  Após o envio, as respostas ficam bloqueadas.
                </p>
                <Button disabled={busy || pending} onClick={submit}>
                  Confirmar envio definitivo
                </Button>
                <Button
                  disabled={busy || pending}
                  onClick={() => setConfirm(false)}
                >
                  Continuar respondendo
                </Button>
              </div>
            )}
          </>
        )}
      </Panel>
    </>
  );
}
