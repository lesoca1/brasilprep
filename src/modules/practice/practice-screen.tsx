'use client';
import { useState } from 'react';
import { useTrack } from '@/components/layout/providers';
import { PageHeading, Panel, Button } from '@/components/ui/primitives';
const topics: Record<string, string[]> = {
  Física: ['Eletricidade', 'Mecânica', 'Óptica'],
  Química: ['Estequiometria', 'Química orgânica'],
  Matemática: ['Funções', 'Probabilidade', 'Geometria'],
  História: ['Brasil República', 'História geral'],
  Português: ['Interpretação de texto', 'Gramática'],
  Biologia: ['Ecologia', 'Genética'],
  Geografia: ['Geografia física', 'Geopolítica'],
};
export function PracticeScreen() {
  const { track } = useTrack();
  return <PracticeForm key={track.id} />;
}
function PracticeForm() {
  const { track } = useTrack();
  const [scope, setScope] = useState('topic');
  const [mode, setMode] = useState('study');
  const [subject, setSubject] = useState(track.practice.subject);
  const [topic, setTopic] = useState(track.practice.topic);
  const [count, setCount] = useState(String(track.practice.count));
  const [difficulty, setDifficulty] = useState('Média');
  return (
    <>
      <PageHeading
        eyebrow={`${track.exam} / PRÁTICA`}
        title="Uma sessão, um foco"
        description="Escolha o que revisar e como responder."
      />
      <div className="form-layout">
        <Panel
          title="Preparar sessão"
          subtitle="Apenas configuração visual nesta fase"
        >
          <div className="form-content">
            <fieldset>
              <legend>O que você quer praticar?</legend>
              <div className="choice-grid">
                {[
                  {
                    id: 'subject',
                    title: 'Por disciplina',
                    note: 'Um conjunto de assuntos',
                  },
                  {
                    id: 'topic',
                    title: 'Por assunto',
                    note: 'Um ponto específico',
                  },
                  {
                    id: 'custom',
                    title: 'Personalizada',
                    note: 'Ajuste os filtros',
                  },
                ].map((o) => (
                  <label className="choice" key={o.id}>
                    <input
                      type="radio"
                      name="scope"
                      value={o.id}
                      checked={scope === o.id}
                      onChange={() => setScope(o.id)}
                    />
                    <span>
                      {o.title}
                      <small>{o.note}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="field-grid">
              <label className="field">
                Disciplina
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setTopic(topics[e.target.value][0]);
                  }}
                >
                  {Object.keys(topics).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              {scope !== 'subject' && (
                <label className="field">
                  Assunto
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  >
                    {topics[subject].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              )}
              <label className="field">
                Número de questões
                <select
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                >
                  {['5', '10', '12', '15', '20', '30'].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Dificuldade
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  {['Todas', 'Fácil', 'Média', 'Difícil'].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset>
              <legend>Modo de resposta</legend>
              <div className="choice-grid">
                <label className="choice">
                  <input
                    name="mode"
                    type="radio"
                    checked={mode === 'study'}
                    onChange={() => setMode('study')}
                  />
                  <span>
                    Estudo<small>Feedback após cada resposta</small>
                  </span>
                </label>
                <label className="choice">
                  <input
                    name="mode"
                    type="radio"
                    checked={mode === 'test'}
                    onChange={() => setMode('test')}
                  />
                  <span>
                    Teste<small>Correção ao finalizar a sessão</small>
                  </span>
                </label>
              </div>
            </fieldset>
          </div>
        </Panel>
        <Panel title="Sua sessão">
          <div className="summary">
            <p className="eyebrow">{track.exam}</p>
            <h3>{scope === 'subject' ? subject : topic}</h3>
            <dl>
              <dt>Disciplina</dt>
              <dd>{subject}</dd>
              <dt>Questões</dt>
              <dd>{count}</dd>
              <dt>Dificuldade</dt>
              <dd>{difficulty}</dd>
              <dt>Modo</dt>
              <dd>{mode === 'study' ? 'Estudo' : 'Teste'}</dd>
            </dl>
            <Button className="primary" disabled>
              Iniciar prática
            </Button>
            <p className="field-hint" style={{ marginTop: 12 }}>
              O motor de prática será construído em uma próxima fase. Suas
              escolhas aqui não são salvas.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
