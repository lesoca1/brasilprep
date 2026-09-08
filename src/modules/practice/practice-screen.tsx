'use client';
import { useActiveTrilha, useApp } from '@/components/layout/providers';
import {
  Button,
  EmptyState,
  PageHeading,
  Panel,
} from '@/components/ui/primitives';
import type { PracticeRepository } from '@/data-access/practice';
import { PracticeSetup } from './practice-setup';
import { PracticeSessionView } from './practice-session';
import { usePractice } from './use-practice';
function PracticeWorkspace({
  repository,
  uid,
}: {
  repository: PracticeRepository;
  uid: string;
}) {
  const current = useActiveTrilha();
  const state = usePractice(repository, uid);
  return (
    <>
      <PageHeading
        eyebrow={`${current?.exam.name ?? 'SUA TRILHA'} / PRÁTICA`}
        title="Praticar"
        description="Escolha a trilha no seletor superior. Sessões já iniciadas mantêm o vestibular original."
      />
      {state.error && (
        <div className="practice-notice" role="alert">
          <p>{state.error}</p>
          <Button disabled={state.busy} onClick={() => void state.sync()}>
            Tentar sincronizar
          </Button>
        </div>
      )}
      {state.pending && (
        <div className="practice-notice">
          <p role="status">
            Existe uma operação pendente. Ela está salva neste navegador e será
            reenviada com o mesmo identificador.
          </p>
          {state.pending.action === 'save' && (
            <p>
              Questão {state.pending.payload.position + 1}: alternativa{' '}
              {state.pending.payload.selected ?? 'em branco'}
              {state.pending.payload.guessed ? ', marcada como chute' : ''}
              {state.pending.payload.flagged ? ', sinalizada' : ''}.
            </p>
          )}
          {state.conflict && (
            <Button
              disabled={state.busy}
              onClick={() => {
                if (
                  window.confirm(
                    'Descartar somente a operação local exibida acima e carregar o que já está salvo no banco?',
                  )
                )
                  void state.discard();
              }}
            >
              Descartar alteração local e carregar banco
            </Button>
          )}
        </div>
      )}
      {state.session ? (
        <PracticeSessionView
          key={state.session.id}
          session={state.session}
          uid={uid}
          busy={state.busy}
          pending={Boolean(state.pending)}
          onOperation={(op) => void state.sync(op)}
          onClose={state.close}
        />
      ) : (
        <>
          {state.busy && <p role="status">Carregando suas práticas…</p>}
          {current ? (
            <PracticeSetup
              key={current.trilha.id}
              repository={repository}
              trilhaId={current.trilha.id}
              busy={state.busy || Boolean(state.pending)}
              onStart={(config) =>
                void state.sync({ action: 'start', payload: config })
              }
            />
          ) : (
            <EmptyState
              title="Selecione uma trilha"
              description="Crie ou escolha sua trilha para iniciar uma prática."
            />
          )}
          <Panel
            title="Suas sessões"
            subtitle="Retome uma sessão aberta ou consulte os resultados."
          >
            {state.sessions.length ? (
              state.sessions.map((s) => (
                <div className="practice-session-row" key={s.id}>
                  <div>
                    <strong>
                      {s.exam_id.toUpperCase()} ·{' '}
                      {s.mode === 'study' ? 'Estudo' : 'Teste'}
                    </strong>
                    <p className="small muted">
                      {s.kind === 'synthetic'
                        ? 'Sintética · Desenvolvimento'
                        : 'Oficial'}{' '}
                      · {new Date(s.started_at).toLocaleString('pt-BR')} ·{' '}
                      {s.submitted_at ? 'Finalizada' : 'Em andamento'}
                    </p>
                  </div>
                  <Button
                    disabled={state.busy || Boolean(state.pending)}
                    onClick={() => void state.resume(s.id)}
                  >
                    {s.submitted_at ? 'Ver resultado' : 'Retomar sessão'}
                  </Button>
                </div>
              ))
            ) : (
              <EmptyState
                title="Nenhuma sessão iniciada"
                description="Configure os filtros acima para começar."
              />
            )}
          </Panel>
        </>
      )}
    </>
  );
}
export function PracticeScreen() {
  const { services, user } = useApp();
  return services && user ? (
    <PracticeWorkspace
      key={user.id}
      repository={services.practice}
      uid={user.id}
    />
  ) : (
    <p role="status">Carregando prática…</p>
  );
}
