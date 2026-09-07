import { PageHeading, Panel, EmptyState } from '@/components/ui/primitives';
export function QuestionsScreen() {
  return (
    <>
      <PageHeading eyebrow="ACERVO" title="Questões" />
      <Panel title="Banco de questões">
        <EmptyState
          title="Nenhuma questão publicada"
          description="Questões com origem e permissão de uso verificadas serão adicionadas em uma próxima fase. Os exercícios sintéticos da Fase 1 não fazem parte da sua conta."
        />
      </Panel>
    </>
  );
}
