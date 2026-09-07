'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/layout/providers';
import {
  PageHeading,
  Panel,
  Button,
  EmptyState,
} from '@/components/ui/primitives';
import { validateSelection } from '@/domain/models';
import { TargetPicker } from './target-picker';
export function OnboardingScreen() {
  const { workspace, services, refresh } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [targets, setTargets] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!workspace) return null;
  const { catalog } = workspace;
  const available = catalog.exams.filter(
    (e) => !workspace.trilhas.some((t) => t.exam_id === e.id),
  );
  async function confirm() {
    if (!services || !workspace) return;
    setBusy(true);
    setError('');
    try {
      const ids = selected.map((id) => targets[id]);
      validateSelection(ids, workspace.catalog);
      await services.workspace.confirmTargets(ids);
      await refresh();
      router.replace('/dashboard');
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível salvar suas trilhas.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow={`SEU OBJETIVO / PASSO ${step} DE 3`}
        title={
          step === 1
            ? 'Quais vestibulares você quer prestar?'
            : step === 2
              ? 'Onde você quer chegar?'
              : 'Confirme suas trilhas'
        }
        description="Você poderá ajustar seus objetivos depois."
      />
      {!available.length ? (
        <EmptyState
          title="Todos os vestibulares disponíveis já estão nas suas trilhas"
          description="Volte às suas trilhas para alterar um objetivo."
        />
      ) : (
        <div className="stack">
          {step === 1 && (
            <Panel title="Escolha um ou mais vestibulares">
              <div className="form-content choice-grid">
                {available.map((exam) => {
                  const enabled = catalog.targets.some(
                    (t) => t.exam_id === exam.id && t.active,
                  );
                  return (
                    <label className="choice" key={exam.id}>
                      <input
                        type="checkbox"
                        disabled={!enabled}
                        checked={selected.includes(exam.id)}
                        onChange={(e) =>
                          setSelected((previous) =>
                            e.target.checked
                              ? [...previous, exam.id]
                              : previous.filter((id) => id !== exam.id),
                          )
                        }
                      />
                      <span>
                        {exam.name}
                        <small>
                          {enabled
                            ? exam.is_development
                              ? 'Catálogo de desenvolvimento'
                              : 'Disponível'
                            : 'Ainda sem objetivos cadastrados'}
                        </small>
                      </span>
                    </label>
                  );
                })}
              </div>
            </Panel>
          )}
          {step === 2 &&
            selected.map((id) => (
              <Panel
                title={catalog.exams.find((e) => e.id === id)?.name ?? id}
                key={id}
              >
                <div className="form-content">
                  <TargetPicker
                    catalog={catalog}
                    examId={id}
                    value={targets[id] ?? ''}
                    onChange={(value) =>
                      setTargets((previous) => ({ ...previous, [id]: value }))
                    }
                  />
                </div>
              </Panel>
            ))}
          {step === 3 &&
            selected.map((id) => {
              const target = catalog.targets.find((t) => t.id === targets[id]);
              const course = catalog.courses.find(
                (c) => c.id === target?.course_id,
              );
              const institution = catalog.institutions.find(
                (i) => i.id === course?.institution_id,
              );
              return (
                <Panel
                  key={id}
                  title={catalog.exams.find((e) => e.id === id)?.name ?? id}
                >
                  <div className="form-content">
                    <h3>
                      {institution?.abbreviation} · {course?.name}
                    </h3>
                    <p className="muted">
                      {course?.campus} · {course?.modality}
                    </p>
                    <p>
                      {target?.admission_year} · {target?.competition_category}
                    </p>
                    <p className="muted small">
                      {target?.is_development
                        ? 'Objetivo de desenvolvimento. '
                        : ''}
                      Nota de corte: {target?.cutoff_score ?? 'não disponível'}.
                    </p>
                  </div>
                </Panel>
              );
            })}
          {error && (
            <p className="notice error" role="alert">
              {error}
            </p>
          )}
          <div className="form-actions">
            {step > 1 && (
              <Button disabled={busy} onClick={() => setStep(step - 1)}>
                Voltar
              </Button>
            )}
            {step < 3 ? (
              <Button
                className="primary"
                disabled={
                  !selected.length ||
                  (step === 2 && selected.some((id) => !targets[id]))
                }
                onClick={() => setStep(step + 1)}
              >
                Continuar
              </Button>
            ) : (
              <Button
                className="primary"
                disabled={busy}
                onClick={() => void confirm()}
              >
                {busy ? 'Salvando...' : 'Confirmar trilhas'}
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
