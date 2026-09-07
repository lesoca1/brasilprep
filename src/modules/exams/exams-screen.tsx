'use client';
import { useActiveTrilha } from '@/components/layout/providers';
import { PageHeading, Panel, EmptyState } from '@/components/ui/primitives';
export function ExamsScreen() {
  const current = useActiveTrilha();
  return (
    <>
      <PageHeading
        eyebrow={`${current?.exam.name ?? 'SUA TRILHA'} / SIMULADOS`}
        title="Simulados"
      />
      <Panel title="Seu histórico">
        <EmptyState
          title="Nenhum simulado realizado"
          description="A execução de simulados será implementada em uma próxima fase, com estrutura e critérios próprios de cada prova."
        />
      </Panel>
    </>
  );
}
