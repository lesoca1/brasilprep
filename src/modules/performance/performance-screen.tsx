'use client';
import { useActiveTrilha } from '@/components/layout/providers';
import { PageHeading, Panel, EmptyState } from '@/components/ui/primitives';
export function PerformanceScreen() {
  const current = useActiveTrilha();
  return (
    <>
      <PageHeading
        eyebrow={`${current?.exam.name ?? 'SUA TRILHA'} / ANÁLISE`}
        title="Desempenho"
      />
      <div className="two-column">
        <Panel title="Evolução">
          <EmptyState
            title="Nenhum resultado registrado"
            description="Os indicadores serão calculados a partir das suas respostas, quando a prática estiver disponível."
          />
        </Panel>
        <Panel title="Comparação entre estudantes">
          <EmptyState
            title="Comparação indisponível"
            description="Não há uma amostra real e comparável. Percentis e distribuição não são estimados com dados fictícios."
          />
        </Panel>
      </div>
    </>
  );
}
