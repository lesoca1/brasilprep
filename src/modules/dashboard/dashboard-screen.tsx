'use client';
import Link from 'next/link';
import { useActiveTrilha, useApp } from '@/components/layout/providers';
import {
  PageHeading,
  Panel,
  EmptyState,
  TextLink,
} from '@/components/ui/primitives';
export function DashboardScreen() {
  const current = useActiveTrilha();
  const { workspace } = useApp();
  return (
    <>
      <PageHeading
        eyebrow="SEU PONTO DE PARTIDA"
        title="Visão geral"
        description={`Olá, ${workspace?.profile.display_name ?? 'estudante'}. Seu objetivo é o começo.`}
      />
      {current ? (
        <section className="target-strip" aria-label="Objetivo de estudo">
          <div>
            <p className="eyebrow">TRILHA ATIVA</p>
            <h2>
              {current.exam.name} / {current.institution.abbreviation} /{' '}
              {current.course.name}
            </h2>
            <p className="muted small">
              {current.course.campus} · {current.course.modality} ·{' '}
              {current.target.admission_year}
            </p>
          </div>
          <TextLink href="/trilhas">Ajustar objetivo</TextLink>
        </section>
      ) : (
        <EmptyState
          title="Selecione uma trilha"
          description="Escolha uma das suas trilhas para visualizar seu objetivo."
        />
      )}
      {current?.target.is_development && (
        <p className="notice" style={{ marginTop: 20 }}>
          Este objetivo usa um catálogo de desenvolvimento. Oferta, modalidades
          e regras de ingresso ainda não foram verificadas.
        </p>
      )}
      <div className="two-column" style={{ marginTop: 24 }}>
        <Panel title="Seu desempenho">
          <EmptyState
            title="Ainda não há resultados"
            description="A prática será implementada em uma próxima fase. Sua conta começa sem respostas ou indicadores de exemplo."
          />
        </Panel>
        <Panel title="Meta de ingresso">
          <EmptyState
            title={
              current?.target.cutoff_score != null
                ? `${current.target.cutoff_score} · ${current.target.score_scale}`
                : 'Nota de corte indisponível'
            }
            description="A distância até a aprovação exige resultados comparáveis e critérios oficiais verificados."
          />
          {current?.target.source_url && (
            <div className="form-content">
              <a
                className="text-link"
                href={current.target.source_url}
                rel="noreferrer"
                target="_blank"
              >
                Consultar fonte da meta
              </a>
            </div>
          )}
        </Panel>
      </div>
      <Link href="/trilhas" className="button">
        Gerenciar minhas trilhas
      </Link>
    </>
  );
}
