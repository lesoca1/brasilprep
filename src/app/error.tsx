'use client';
import { Button, EmptyState } from '@/components/ui/primitives';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <>
      <EmptyState
        title="Não foi possível abrir esta tela"
        description="Tente novamente. Se o problema continuar, volte à visão geral."
      />
      <Button onClick={reset}>Tentar novamente</Button>
    </>
  );
}
