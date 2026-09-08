'use client';
import { useEffect, useState } from 'react';
import { Button, Panel } from '@/components/ui/primitives';
import {
  availableQuestions,
  type PracticeCatalog,
  type PracticeConfig,
} from '@/domain/practice';
import type { PracticeRepository } from '@/data-access/practice';
export function PracticeSetup({
  repository,
  trilhaId,
  onStart,
  busy,
}: {
  repository: PracticeRepository;
  trilhaId: string;
  onStart: (config: PracticeConfig) => void;
  busy: boolean;
}) {
  const [catalog, setCatalog] = useState<PracticeCatalog>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    Omit<PracticeConfig, 'id' | 'trilha_id'>
  >({
    mode: 'study',
    kind: 'official',
    type: 'custom',
    subject: '',
    topic: '',
    difficulty: '',
    year: '',
    count: 10,
  });
  useEffect(() => {
    let cancelled = false;
    repository
      .catalog(trilhaId)
      .then((data) => {
        if (!cancelled) {
          setCatalog(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : 'Erro ao carregar filtros.',
          );
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [repository, trilhaId]);
  const subset = catalog.filter((c) => c.kind === filter.kind);
  const subjects = [
    ...new Map(subset.map((c) => [c.subject.key, c.subject])).values(),
  ];
  const topics = [
    ...new Map(
      subset
        .filter((c) => c.subject.key === filter.subject)
        .map((c) => [c.topic.key, c.topic]),
    ).values(),
  ];
  const available = availableQuestions(catalog, filter);
  const valid =
    Number.isInteger(filter.count) &&
    filter.count >= 1 &&
    filter.count <= 100 &&
    filter.count <= available &&
    (filter.type === 'custom' || Boolean(filter.subject)) &&
    (filter.type !== 'topic' || Boolean(filter.topic));
  return (
    <Panel
      title="Configurar prática"
      subtitle="A sessão fica vinculada à trilha selecionada ao iniciar."
    >
      <form
        className="practice-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (valid)
            onStart({
              ...filter,
              id: crypto.randomUUID(),
              trilha_id: trilhaId,
            });
        }}
      >
        {error && <p role="alert">{error}</p>}
        <label>
          Tipo de prática
          <select
            value={filter.type}
            disabled={busy}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                type: e.target.value as PracticeConfig['type'],
              }))
            }
          >
            <option value="custom">Personalizada</option>
            <option value="subject">Por disciplina</option>
            <option value="topic">Por assunto</option>
          </select>
        </label>
        <label>
          Modo
          <select
            value={filter.mode}
            disabled={busy}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                mode: e.target.value as PracticeConfig['mode'],
              }))
            }
          >
            <option value="study">Estudo: correção após responder</option>
            <option value="test">Teste: correção ao finalizar</option>
          </select>
        </label>
        <label>
          Origem das questões
          <select
            value={filter.kind}
            disabled={busy}
            onChange={(e) =>
              setFilter((f) => ({
                ...f,
                kind: e.target.value as PracticeConfig['kind'],
                subject: '',
                topic: '',
                year: '',
              }))
            }
          >
            <option value="official">Questões oficiais autorizadas</option>
            <option value="synthetic">
              Exercícios sintéticos de desenvolvimento
            </option>
          </select>
        </label>
        <label>
          Disciplina
          <select
            value={filter.subject}
            disabled={busy}
            required={filter.type !== 'custom'}
            onChange={(e) =>
              setFilter((f) => ({ ...f, subject: e.target.value, topic: '' }))
            }
          >
            <option value="">Todas</option>
            {subjects.map((s) => (
              <option key={s.key} value={s.key}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Assunto
          <select
            value={filter.topic}
            disabled={busy || !filter.subject}
            required={filter.type === 'topic'}
            onChange={(e) =>
              setFilter((f) => ({ ...f, topic: e.target.value }))
            }
          >
            <option value="">Todos</option>
            {topics.map((t) => (
              <option key={t.key} value={t.key}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Dificuldade
          <select
            value={filter.difficulty}
            disabled={busy}
            onChange={(e) =>
              setFilter((f) => ({ ...f, difficulty: e.target.value }))
            }
          >
            <option value="">Todas</option>
            <option value="easy">Fácil</option>
            <option value="medium">Média</option>
            <option value="hard">Difícil</option>
          </select>
        </label>
        <label>
          Ano
          <select
            value={filter.year}
            disabled={busy}
            onChange={(e) => setFilter((f) => ({ ...f, year: e.target.value }))}
          >
            <option value="">Todos</option>
            {[...new Set(subset.map((c) => c.year))]
              .sort((a, b) => b - a)
              .map((y) => (
                <option key={y}>{y}</option>
              ))}
          </select>
        </label>
        <label>
          Quantidade de questões
          <input
            type="number"
            min={1}
            max={100}
            required
            value={filter.count}
            disabled={busy}
            onChange={(e) =>
              setFilter((f) => ({ ...f, count: Number(e.target.value) }))
            }
          />
        </label>
        <div className="practice-wide">
          {loading ? (
            <p role="status">Carregando acervo…</p>
          ) : (
            <p>{available} questão(ões) disponível(is) com estes filtros.</p>
          )}
          {filter.kind === 'synthetic' && (
            <p className="data-note">
              Conteúdo sintético para desenvolvimento. Não são questões
              aplicadas pelo vestibular.
            </p>
          )}
          {filter.count > available && !loading && (
            <p>Reduza a quantidade ou ajuste os filtros para iniciar.</p>
          )}
          <Button disabled={busy || loading || !valid}>
            {busy ? 'Preparando sessão…' : 'Iniciar prática'}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
