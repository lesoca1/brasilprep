'use client';
import { useTrack } from '@/components/layout/providers';
import {
  PageHeading,
  Panel,
  EmptyState,
  Button,
} from '@/components/ui/primitives';
export function ExamsScreen() {
  const { track } = useTrack();
  return (
    <>
      <PageHeading
        eyebrow={`${track.exam} / SIMULADOS`}
        title="Treine a prova inteira"
        description="Uma visão dedicada ao desempenho em condições de prova."
      />
      <div className="two-column">
        <section className="track-card">
          <div className="card-top">
            <h2>{track.exam}</h2>
            <span className="tag">Em preparação</span>
          </div>
          <div>
            <p className="eyebrow">SIMULADO COMPLETO</p>
            <h3>Do início à correção</h3>
            <p className="muted">
              Estrutura, duração e critérios serão definidos com base nas regras
              oficiais da edição escolhida.
            </p>
          </div>
          <dl className="track-details">
            <div>
              <dt>Edição</dt>
              <dd>A definir</dd>
            </div>
            <div>
              <dt>Formato e duração</dt>
              <dd>A validar</dd>
            </div>
          </dl>
          <Button disabled>Iniciar simulado</Button>
        </section>
        <Panel title="Seu histórico">
          <EmptyState
            title="Nenhum simulado realizado"
            description="Quando houver simulados concluídos, você poderá acompanhar resultados, tempo de prova e evolução por edição."
          />
        </Panel>
      </div>
      <div className="section-note">
        <strong>Prática e simulado medem coisas distintas.</strong> O acerto em
        sessões livres não será apresentado como nota oficial. Cada exame terá
        critérios próprios.
      </div>
    </>
  );
}
