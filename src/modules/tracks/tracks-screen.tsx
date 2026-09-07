'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useApp } from '@/components/layout/providers';
import { describeTrilha, type Trilha } from '@/domain/models';
import { PageHeading, Button, EmptyState } from '@/components/ui/primitives';
import { TargetPicker } from '@/modules/onboarding/target-picker';
export function TracksScreen() {
  const { workspace } = useApp();
  return (
    <>
      <PageHeading
        eyebrow="DIREÇÃO"
        title="Minhas trilhas"
        description="Seus objetivos ficam salvos na sua conta."
        action={
          <Link href="/onboarding" className="button primary">
            Adicionar trilha
          </Link>
        }
      />
      {workspace?.trilhas.length ? (
        <div className="two-column">
          {workspace.trilhas.map((t) => (
            <TrilhaCard key={`${t.id}-${t.target_id}`} trilha={t} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Você ainda não tem trilhas"
          description="Adicione um vestibular e escolha seu objetivo de ingresso."
        />
      )}
    </>
  );
}
function TrilhaCard({ trilha }: { trilha: Trilha }) {
  const { workspace, services, refresh } = useApp();
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [targetId, setTargetId] = useState(trilha.target_id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!workspace) return null;
  const details = describeTrilha(trilha, workspace.catalog);
  const active = workspace.profile.active_trilha_id === trilha.id;
  async function act(operation: 'switch' | 'edit' | 'remove') {
    if (!services) return;
    setBusy(true);
    setError('');
    try {
      if (operation === 'switch')
        await services.workspace.switchTrilha(trilha.id);
      if (operation === 'edit')
        await services.workspace.changeTarget(trilha.id, targetId);
      if (operation === 'remove')
        await services.workspace.removeTrilha(trilha.id);
      await refresh();
      setEditing(false);
      setRemoving(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível salvar.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={`track-card ${active ? 'active' : ''}`}>
      <div className="card-top">
        <h2>{details?.exam.name ?? trilha.exam_id}</h2>
        {active && <span className="tag active">Trilha ativa</span>}
      </div>
      <div>
        <p className="eyebrow">{details?.institution.abbreviation}</p>
        <h3>{details?.course.name ?? 'Objetivo indisponível no catálogo'}</h3>
        <p className="muted small">
          {details?.course.campus} · {details?.course.modality}
        </p>
      </div>
      {details && (
        <>
          <p className="small">
            {details.target.admission_year} ·{' '}
            {details.target.competition_category}
          </p>
          <p className="muted small">
            {details.target.is_development
              ? 'Catálogo de desenvolvimento. '
              : ''}
            Nota de corte: {details.target.cutoff_score ?? 'não disponível'}.
          </p>
        </>
      )}
      {editing ? (
        <form
          className="stack"
          onSubmit={(e) => {
            e.preventDefault();
            void act('edit');
          }}
        >
          <TargetPicker
            catalog={workspace.catalog}
            examId={trilha.exam_id}
            value={targetId}
            onChange={setTargetId}
            disabled={busy}
          />
          <div className="form-actions">
            <Button
              type="submit"
              className="primary"
              disabled={busy || !targetId}
            >
              Salvar objetivo
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => {
                setEditing(false);
                setTargetId(trilha.target_id);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      ) : removing ? (
        <div className="notice">
          <h3>Remover esta trilha?</h3>
          <p>
            A trilha e seu objetivo serão removidos da sua conta. Você poderá
            criar uma nova depois.
          </p>
          <div className="form-actions">
            <Button disabled={busy} onClick={() => void act('remove')}>
              Confirmar remoção
            </Button>
            <Button disabled={busy} onClick={() => setRemoving(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="form-actions">
          <Button disabled={busy || active} onClick={() => void act('switch')}>
            {active ? 'Selecionada' : 'Selecionar'}
          </Button>
          <Button disabled={busy} onClick={() => setEditing(true)}>
            Alterar objetivo
          </Button>
          <Button disabled={busy} onClick={() => setRemoving(true)}>
            Remover
          </Button>
        </div>
      )}
      {error && (
        <p className="notice error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
