import type { Metadata } from 'next';
import { LandingPage } from '@/modules/landing/landing-page';

export const metadata: Metadata = {
  title: 'BrasilPrep | Estude com método. Acompanhe sua evolução.',
  description:
    'Organize seus vestibulares em trilhas, pratique por assunto e acompanhe seu desempenho. Conheça o BrasilPrep e prepare-se com mais clareza.',
};

export default function Page() {
  return <LandingPage />;
}
