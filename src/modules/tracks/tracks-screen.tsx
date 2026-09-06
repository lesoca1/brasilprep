'use client';
import { demoTracks } from '@/data/demo';
import { useTrack } from '@/components/layout/providers';
import {
  PageHeading,
  Button,
  TextLink,
  Panel,
  EmptyState,
} from '@/components/ui/primitives';
export function TracksScreen() {
  const { exam, setExam } = useTrack();
  return (
    <>
      <PageHeading
        eyebrow="DIREÇÃO"
        title="Minhas trilhas"
        description="Cada vestibular tem seu próprio caminho e seus próprios resultados."
      />
      <div className="two-column">
        {Object.values(demoTracks).map((track) => (
          <section
            className={`track-card ${exam === track.id ? 'active' : ''}`}
            key={track.id}
          >
            <div className="card-top">
              <h2>{track.exam}</h2>
              <span className={`tag ${exam === track.id ? 'active' : ''}`}>
                {exam === track.id ? 'Em visualização' : 'Trilha de exemplo'}
              </span>
            </div>
            <div>
              <p className="eyebrow">{track.institution}</p>
              <h3>{track.course}</h3>
              <p className="muted small">{track.campus}</p>
            </div>
            <dl className="track-details">
              <div>
                <dt>Acerto ilustrativo</dt>
                <dd>{track.accuracy}</dd>
              </div>
              <div>
                <dt>Meta de prática fictícia</dt>
                <dd>{track.target}</dd>
              </div>
              <div className="official">
                <dt>Nota de corte oficial</dt>
                <dd>Não disponível</dd>
              </div>
            </dl>
            <Button
              onClick={() => setExam(track.id)}
              disabled={exam === track.id}
            >
              {exam === track.id
                ? 'Trilha selecionada'
                : 'Visualizar esta trilha'}
            </Button>
            <TextLink href="/dashboard">Abrir visão geral</TextLink>
          </section>
        ))}
      </div>
      <Panel title="Outros vestibulares">
        <EmptyState
          title="Novas trilhas em uma próxima fase"
          description="FGV, Insper, UNESP, ITA, IME e ENEM fazem parte do escopo futuro. A seleção de curso e o cadastro de metas ainda não estão disponíveis."
        />
      </Panel>
    </>
  );
}
