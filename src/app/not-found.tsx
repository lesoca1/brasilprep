import Link from 'next/link';
import { EmptyState } from '@/components/ui/primitives';
export default function NotFound() {
  return (
    <>
      <EmptyState
        title="Página não encontrada"
        description="O endereço pode ter mudado. Acesse seu espaço pela navegação."
      />
      <Link className="button" href="/dashboard">
        Voltar à visão geral
      </Link>
    </>
  );
}
