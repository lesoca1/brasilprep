'use client';
import { useActiveTrilha } from '@/components/layout/providers';
import { PageHeading, Panel, EmptyState } from '@/components/ui/primitives';
export function PracticeScreen() {
  const current = useActiveTrilha();
  return (
    <>
      <PageHeading
        eyebrow={`${current?.exam.name ?? 'SUA TRILHA'} / PRÁTICA`}
        title="Praticar"
      />
      <Panel title="Suas próximas sessões">
        <EmptyState
          title="Prática em uma próxima fase"
          description="Sua trilha está salva. O banco de questões, o motor de respostas e a correção serão implementados depois."
        />
      </Panel>
    </>
  );
}
