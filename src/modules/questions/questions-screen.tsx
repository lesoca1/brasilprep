'use client';
import { useState } from 'react';
import { useTrack } from '@/components/layout/providers';
import { questions } from '@/data/demo';
import { PageHeading, EmptyState } from '@/components/ui/primitives';
export function QuestionsScreen() {
  const { exam } = useTrack();
  return <QuestionCatalog key={exam} />;
}
function QuestionCatalog() {
  const { track, exam } = useTrack();
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('Todas');
  const rows = questions.filter((q) => q.exam === exam);
  const filtered = rows.filter(
    (q) =>
      (subject === 'Todas' || q.subject === subject) &&
      `${q.id} ${q.topic} ${q.statement}`
        .toLocaleLowerCase('pt-BR')
        .includes(query.toLocaleLowerCase('pt-BR')),
  );
  return (
    <>
      <PageHeading
        eyebrow={`${track.exam} / ACERVO`}
        title="Questões"
        description="Explore a organização do banco de questões."
      />
      <p className="section-note">
        <strong>Conteúdo sintético.</strong> Estes exercícios foram criados para
        demonstração. Não são questões oficiais e não representam o nível ou o
        formato do vestibular.
      </p>
      <div className="toolbar">
        <label className="field search-field">
          Buscar questão
          <input
            className="search-input"
            type="search"
            placeholder="Assunto, enunciado ou código"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label className="field">
          Disciplina
          <select value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option>Todas</option>
            {[...new Set(rows.map((q) => q.subject))].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <p
        className="muted small"
        aria-live="polite"
        style={{ marginBottom: 16 }}
      >
        {filtered.length}{' '}
        {filtered.length === 1 ? 'questão encontrada' : 'questões encontradas'}
      </p>
      <div className="questions-list">
        {filtered.map((q) => (
          <article className="question-card" key={q.id}>
            <div className="question-meta">
              <strong>{q.id}</strong>
              <span>{q.subject}</span>
              <span>{q.topic}</span>
              <span className="tag">{q.difficulty}</span>
              <span>Sintética · sem ano ou fase oficial</span>
            </div>
            <p>{q.statement}</p>
            <details>
              <summary>Ver alternativas e explicação</summary>
              <ol className="alternatives">
                {q.alternatives.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ol>
              <div className="explanation">
                <strong>Resposta {q.answer}</strong>
                <p>{q.explanation}</p>
              </div>
            </details>
          </article>
        ))}
        {!filtered.length && (
          <EmptyState
            title="Nenhuma questão encontrada"
            description="Tente outro termo ou selecione todas as disciplinas."
          />
        )}
      </div>
    </>
  );
}
