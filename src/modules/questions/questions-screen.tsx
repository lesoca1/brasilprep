'use client';
import { useEffect, useState } from 'react';
import { useApp } from '@/components/layout/providers';
import {
  PageHeading,
  Panel,
  EmptyState,
  Button,
} from '@/components/ui/primitives';
import {
  letters,
  validateQuestionBatch,
  type QuestionInput,
  type QuestionRow,
  type QuestionFilter,
} from '@/domain/questions';
const difficultyLabels = { easy: 'Fácil', medium: 'Média', hard: 'Difícil' };
function QuestionMedia({ url, alt }: { url: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <p role="status">Imagem indisponível: {alt}</p>
  ) : (
    // Arbitrary durable HTTPS sources are validated on import; dimensions remain responsive.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="question-image"
      src={url}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
function QuestionDetail({ q }: { q: QuestionInput }) {
  return (
    <div className="question-detail">
      <p className="data-note">
        {q.kind === 'synthetic'
          ? 'SINTÉTICA · Desenvolvimento. Não aplicada pelo vestibular.'
          : 'OFICIAL · Fonte e permissão declaradas pelo importador.'}
      </p>
      <p className="small muted">
        {q.exam.toUpperCase()} · {q.year} · Fase {q.phase} ·{' '}
        {difficultyLabels[q.difficulty]} · Múltipla escolha A-E
      </p>
      <p className="small">
        {q.subject.name} / {q.topic.name} / {q.subtopic.name}
      </p>
      <p className="question-statement">{q.statement}</p>
      {q.images.map((m) => (
        <QuestionMedia key={m.url} {...m} />
      ))}
      <ol type="A">
        {letters.map((l) => (
          <li key={l}>{q.alternatives[l]}</li>
        ))}
      </ol>
      <p>
        <strong>Gabarito: {q.correct_answer}</strong>
      </p>
      <p className="question-statement">{q.explanation}</p>
      <p className="small">
        Fonte:{' '}
        {q.source.url ? (
          <a
            className="text-link"
            href={q.source.url}
            target="_blank"
            rel="noreferrer"
          >
            {q.source.title}
          </a>
        ) : (
          q.source.title
        )}
      </p>
      <p className="small muted">Permissão: {q.source.permission}</p>
      <p className="small muted">ID: {q.id}</p>
    </div>
  );
}
export function QuestionsScreen() {
  const { services, workspace, user } = useApp();
  const [access, setAccess] = useState<
    'loading' | 'editor' | 'denied' | 'error'
  >('loading');
  const [filter, setFilter] = useState<QuestionFilter>({
    exam: '',
    kind: '',
    difficulty: '',
    page: 0,
  });
  const [rows, setRows] = useState<QuestionRow[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [batch, setBatch] = useState<QuestionInput[]>([]);
  const [issues, setIssues] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false;
    services?.questions
      .isEditor()
      .then((ok) => {
        if (!cancelled) setAccess(ok ? 'editor' : 'denied');
      })
      .catch((e) => {
        if (!cancelled) {
          setAccess('error');
          setError(e instanceof Error ? e.message : 'Erro de acesso.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [services, user?.id, revision]);
  useEffect(() => {
    if (access !== 'editor' || !services) return;
    let cancelled = false;
    services.questions
      .list(filter)
      .then((result) => {
        if (!cancelled) {
          setRows(result.rows);
          setCount(result.count);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erro ao carregar.');
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [access, services, filter, revision]);
  function changeFilter(key: 'exam' | 'kind' | 'difficulty', value: string) {
    setLoading(true);
    setError('');
    setRows([]);
    setFilter((f) => ({ ...f, [key]: value, page: 0 }));
  }
  async function readFile(file: File | undefined) {
    setBatch([]);
    setIssues([]);
    setNotice('');
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error('O arquivo excede 5 MB. Divida em lotes menores.');
      const result = validateQuestionBatch(
        JSON.parse(await file.text()) as unknown,
      );
      setBatch(result.questions);
      setIssues(result.errors);
    } catch (e) {
      setIssues([
        e instanceof SyntaxError
          ? 'JSON inválido. Verifique a sintaxe do arquivo.'
          : e instanceof Error
            ? e.message
            : 'Não foi possível ler o arquivo.',
      ]);
    } finally {
      setBusy(false);
    }
  }
  async function importBatch() {
    if (!services || !batch.length) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const n = await services.questions.importBatch(batch);
      setNotice(
        `${n} questão(ões) adicionada(s). ${batch.length - n} já existente(s), sem alterações.`,
      );
      setBatch([]);
      setLoading(true);
      setRevision((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro na importação.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="ACERVO INTERNO"
        title="Questões"
        description="Consulta editorial e importação em lote."
      />
      {error && (
        <p role="alert" className="data-note">
          {error}{' '}
          <Button
            onClick={() => {
              setError('');
              setRevision((n) => n + 1);
            }}
          >
            Tentar novamente
          </Button>
        </p>
      )}
      {access === 'loading' && (
        <p role="status">Verificando acesso ao acervo…</p>
      )}
      {access === 'denied' && (
        <Panel title="Acesso restrito">
          <EmptyState
            title="Acervo disponível para editores"
            description="Solicite ao responsável pelo projeto acesso editorial. As questões ainda não estão disponíveis para prática."
          />
        </Panel>
      )}
      {access === 'editor' && (
        <>
          <Panel
            title="Importar questões"
            subtitle="JSON com até 500 questões. O lote inteiro é validado antes de ser salvo."
          >
            <div className="question-import">
              <a
                className="text-link"
                href="/question-import.synthetic.json"
                download
              >
                Baixar exemplo sintético
              </a>
              <label>
                Arquivo JSON
                <input
                  type="file"
                  accept=".json,application/json"
                  disabled={busy}
                  onChange={(e) => void readFile(e.target.files?.[0])}
                />
              </label>
              {issues.length > 0 && (
                <div role="alert">
                  <p>
                    {issues.length} erro(s). Corrija o arquivo antes de
                    importar.
                  </p>
                  <ul>
                    {issues.slice(0, 30).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                  {issues.length > 30 && <p>Exibindo os primeiros 30 erros.</p>}
                </div>
              )}
              {batch.length > 0 && (
                <>
                  <p>
                    {batch.length} questão(ões) validada(s):{' '}
                    {batch.filter((q) => q.kind === 'synthetic').length}{' '}
                    sintética(s),{' '}
                    {batch.filter((q) => q.kind === 'official').length}{' '}
                    oficial(is). A origem e os direitos devem ser revisados
                    antes da importação.
                  </p>
                  <Button disabled={busy} onClick={() => void importBatch()}>
                    {busy ? 'Importando…' : 'Confirmar importação'}
                  </Button>
                </>
              )}
              {notice && <p role="status">{notice}</p>}
            </div>
          </Panel>
          <Panel
            title="Consultar acervo"
            subtitle="Gabaritos visíveis apenas neste ambiente editorial."
          >
            <div className="question-filters">
              <label>
                Vestibular
                <select
                  value={filter.exam}
                  onChange={(e) => changeFilter('exam', e.target.value)}
                >
                  <option value="">Todos</option>
                  {workspace?.catalog.exams.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Origem
                <select
                  value={filter.kind}
                  onChange={(e) => changeFilter('kind', e.target.value)}
                >
                  <option value="">Todas</option>
                  <option value="synthetic">Sintéticas</option>
                  <option value="official">Oficiais</option>
                </select>
              </label>
              <label>
                Dificuldade
                <select
                  value={filter.difficulty}
                  onChange={(e) => changeFilter('difficulty', e.target.value)}
                >
                  <option value="">Todas</option>
                  {Object.entries(difficultyLabels).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {loading ? (
              <p role="status">Carregando questões…</p>
            ) : (
              <>
                <p className="small muted">
                  {count} questão(ões) encontrada(s)
                </p>
                {!rows.length ? (
                  <EmptyState
                    title="Nenhuma questão encontrada"
                    description="Importe um arquivo validado ou ajuste os filtros."
                  />
                ) : (
                  rows.map((row) => (
                    <details className="question-record" key={row.id}>
                      <summary>
                        <span>
                          {row.kind === 'synthetic' ? 'Sintética' : 'Oficial'} ·{' '}
                          {row.exam_id.toUpperCase()} · {row.year} ·{' '}
                          {row.payload.subject.name}
                        </span>
                        <span className="muted">
                          {row.payload.statement.slice(0, 140)}
                        </span>
                      </summary>
                      <QuestionDetail q={row.payload} />
                    </details>
                  ))
                )}
                <div className="question-pagination">
                  <Button
                    disabled={filter.page === 0}
                    onClick={() => {
                      setLoading(true);
                      setFilter((f) => ({ ...f, page: f.page - 1 }));
                    }}
                  >
                    Anterior
                  </Button>
                  <span>
                    Página {filter.page + 1} de{' '}
                    {Math.max(1, Math.ceil(count / 20))}
                  </span>
                  <Button
                    disabled={(filter.page + 1) * 20 >= count}
                    onClick={() => {
                      setLoading(true);
                      setFilter((f) => ({ ...f, page: f.page + 1 }));
                    }}
                  >
                    Próxima
                  </Button>
                </div>
              </>
            )}
          </Panel>
        </>
      )}
    </>
  );
}
