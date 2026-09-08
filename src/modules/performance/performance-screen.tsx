'use client';
import { useEffect, useState } from 'react';
import { useActiveTrilha, useApp } from '@/components/layout/providers';
import {
  PageHeading,
  Panel,
  EmptyState,
  Button,
} from '@/components/ui/primitives';
import {
  accuracyBy,
  historicalPerformance,
  recentPerformance,
  type AnswerDataset,
} from '@/analytics/performance';
import { MetricReport, MetricTable } from './metric-report';
export function PerformanceScreen() {
  const { user } = useApp();
  return <PerformanceWorkspace key={user?.id ?? 'anonymous'} />;
}
function PerformanceWorkspace() {
  const current = useActiveTrilha();
  const { services } = useApp();
  const [data, setData] = useState<AnswerDataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [mode, setMode] = useState('test');
  const [kind, setKind] = useState('official');
  useEffect(() => {
    let cancelled = false;
    if (!services) return;
    services.analytics
      .load()
      .then((value) => {
        if (!cancelled) setData(value);
      })
      .catch(() => {
        if (!cancelled)
          setError(
            'Não foi possível carregar o histórico completo. Tente novamente.',
          );
      });
    return () => {
      cancelled = true;
    };
  }, [services, attempt]);
  const matching =
    data?.rows.filter((r) => r.mode === mode && r.kind === kind) ?? [];
  const rows = matching.filter((r) => r.exam_id === current?.exam.id);
  const recent = data ? recentPerformance(rows, data.as_of) : null;
  return (
    <>
      <PageHeading
        eyebrow={`${current?.exam.name ?? 'SUA TRILHA'} / ANÁLISE`}
        title="Desempenho"
        description="Resultados de sessões finalizadas, calculados a partir das respostas salvas."
      />
      <Panel title="Recorte">
        <div className="practice-pad">
          <label>
            Modo{' '}
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="test">Teste</option>
              <option value="study">Estudo</option>
            </select>
          </label>{' '}
          <label>
            Origem{' '}
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="official">Questões oficiais</option>
              <option value="synthetic">
                Questões sintéticas de desenvolvimento
              </option>
            </select>
          </label>
          {kind === 'synthetic' && (
            <p className="data-note">
              Conteúdo sintético de desenvolvimento. Não representa desempenho
              em provas oficiais.
            </p>
          )}
        </div>
      </Panel>
      {error ? (
        <Panel title="Histórico indisponível">
          <p role="alert">{error}</p>
          <Button
            onClick={() => {
              setData(null);
              setError(null);
              setAttempt((n) => n + 1);
            }}
          >
            Tentar novamente
          </Button>
        </Panel>
      ) : !data ? (
        <p role="status">Carregando histórico completo…</p>
      ) : (
        <>
          {!rows.length ? (
            <EmptyState
              title="Nenhuma sessão finalizada neste recorte"
              description="Confira a Trilha, o modo e a origem selecionados. Sessões em andamento não entram nos indicadores."
            />
          ) : (
            <MetricReport rows={rows} />
          )}
          {recent && (
            <MetricTable
              title="Desempenho recente"
              groups={[
                {
                  key: 'current',
                  label: 'Últimos 30 dias',
                  metrics: recent.current,
                },
                {
                  key: 'previous',
                  label: '30 dias anteriores',
                  metrics: recent.previous,
                },
              ]}
            />
          )}
          <MetricTable
            title="Histórico mensal"
            groups={historicalPerformance(rows)}
          />
          <p className="data-note">
            Meses de conclusão no fuso de São Paulo. Apenas meses com sessões
            são exibidos. Recorte recente: janelas de 30 dias até{' '}
            {new Date(data.as_of).toLocaleString('pt-BR', {
              timeZone: 'America/Sao_Paulo',
            })}{' '}
            (São Paulo).
          </p>
          <MetricTable
            title="Por vestibular, no modo e origem selecionados"
            groups={accuracyBy(matching, 'exam')}
          />
          <Button
            onClick={() => {
              setData(null);
              setAttempt((n) => n + 1);
            }}
          >
            Atualizar histórico
          </Button>
        </>
      )}
    </>
  );
}
