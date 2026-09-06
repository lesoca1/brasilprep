'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTrack } from '@/components/layout/providers';
import {
  PageHeading,
  Panel,
  TextLink,
  DemoNote,
} from '@/components/ui/primitives';
import { TrendChart } from './trend-chart';
import { sessions } from '@/data/demo';
export function DashboardScreen() {
  const { track, exam } = useTrack();
  return (
    <>
      <PageHeading
        eyebrow="SEU PONTO DE PARTIDA"
        title="Visão geral"
        description="Entenda seu momento. Direcione o próximo estudo."
        action={
          <Link className="button primary" href="/praticar">
            Preparar prática <ArrowRight size={16} />
          </Link>
        }
      />
      <section className="target-strip" aria-label="Objetivo de estudo">
        <div>
          <span className="eyebrow">OBJETIVO</span>
          <h2>
            {track.exam} <span className="muted">/</span> {track.institution}{' '}
            <span className="muted">/</span> {track.course}
          </h2>
          <p className="muted small">{track.campus}</p>
        </div>
        <TextLink href="/trilhas">Ver trilhas</TextLink>
      </section>
      <section className="metrics" aria-label="Indicadores ilustrativos">
        {[
          {
            label: 'Acerto em prática',
            value: track.accuracy,
            note: 'Exemplo de nível atual',
          },
          {
            label: 'Meta de prática',
            value: track.target,
            note: 'Ilustrativa, sem nota de corte',
          },
          {
            label: 'Distância até a meta',
            value: track.gap,
            note: 'Abaixo da meta ilustrativa',
          },
          {
            label: 'Respostas registradas',
            value: track.answered,
            note: 'Volume fictício de prática',
          },
        ].map((m) => (
          <div className="metric" key={m.label}>
            <p>{m.label}</p>
            <strong>{m.value}</strong>
            <span className="muted small">{m.note}</span>
          </div>
        ))}
      </section>
      <div className="dashboard-grid">
        <Panel
          title="Evolução do acerto"
          subtitle="Prática por mês · dados ilustrativos"
          action={<TextLink href="/desempenho">Detalhar</TextLink>}
        >
          <TrendChart track={track} />
        </Panel>
        <Panel
          title="Próximo foco"
          subtitle="Sugestão ilustrativa, sem motor de recomendação"
          className="focus-panel"
        >
          <div className="focus-content">
            <p className="eyebrow">{track.practice.subject.toUpperCase()}</p>
            <h3>{track.practice.topic}</h3>
            <p className="muted">
              Um exemplo de como a plataforma poderá orientar sua próxima
              sessão.
            </p>
            <dl className="focus-meta">
              <div>
                <dt>Questões</dt>
                <dd>{track.practice.count}</dd>
              </div>
              <div>
                <dt>Dificuldade</dt>
                <dd>{track.practice.difficulty}</dd>
              </div>
            </dl>
            <Link href="/praticar" className="button">
              Ver opções de prática <ArrowRight size={16} />
            </Link>
          </div>
        </Panel>
      </div>
      <div className="dashboard-grid">
        <Panel
          title="Por disciplina"
          subtitle={`${track.exam} · exemplos de acerto`}
          action={<TextLink href="/desempenho">Ver todas</TextLink>}
        >
          <div className="subject-list">
            {[...track.subjects.slice(0, 2), ...track.subjects.slice(-2)].map(
              (s) => (
                <div className="subject-row" key={s.name}>
                  <span>{s.name}</span>
                  <span className="bar-track">
                    <span
                      style={{ width: `${s.accuracy}%` }}
                      className={s.accuracy < 65 ? 'bar-fill low' : 'bar-fill'}
                    />
                  </span>
                  <strong>{s.accuracy}%</strong>
                </div>
              ),
            )}
          </div>
        </Panel>
        <Panel
          title="Práticas recentes"
          subtitle="Histórico ilustrativo"
          action={<TextLink href="/praticar">Praticar</TextLink>}
        >
          <div className="session-list">
            {sessions
              .filter((s) => s.exam === exam)
              .map((s) => (
                <div className="session-row" key={s.id}>
                  <span className="session-date">{s.date}</span>
                  <div>
                    <strong>{s.title}</strong>
                    <span className="muted small">
                      {s.subject} · {s.count} questões
                    </span>
                  </div>
                  <strong>{s.accuracy}</strong>
                </div>
              ))}
          </div>
        </Panel>
      </div>
      <DemoNote />
    </>
  );
}
