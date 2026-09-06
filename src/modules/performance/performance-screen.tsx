'use client';
import { useTrack } from '@/components/layout/providers';
import {
  PageHeading,
  Panel,
  EmptyState,
  DemoNote,
} from '@/components/ui/primitives';
import { TrendChart } from '@/modules/dashboard/trend-chart';
export function PerformanceScreen() {
  const { track } = useTrack();
  return (
    <>
      <PageHeading
        eyebrow={`${track.exam} / ANÁLISE`}
        title="Desempenho"
        description="Observe a evolução e encontre os pontos que pedem revisão."
      />
      <div className="dashboard-grid">
        <Panel
          title="Evolução mensal"
          subtitle="Acerto em prática · série fictícia"
        >
          <TrendChart track={track} />
        </Panel>
        <Panel
          title="Sua posição no grupo"
          subtitle="Comparação entre estudantes"
        >
          <EmptyState
            title="Comparação indisponível"
            description="Ainda não há uma amostra real e comparável. Percentil e distribuição só serão exibidos quando houver dados suficientes e critérios definidos."
          />
        </Panel>
      </div>
      <Panel
        title="Desempenho por disciplina"
        subtitle={`Exemplos independentes de apresentação · ${track.exam}`}
      >
        <div className="table-wrap">
          <table>
            <caption className="sr-only">
              Acertos fictícios por disciplina. Estes exemplos não compõem um
              cálculo de nota.
            </caption>
            <thead>
              <tr>
                <th scope="col">Disciplina</th>
                <th scope="col" className="numeric">
                  Respostas
                </th>
                <th scope="col" className="numeric">
                  Acerto
                </th>
                <th scope="col">Leitura ilustrativa</th>
              </tr>
            </thead>
            <tbody>
              {track.subjects.map((s) => (
                <tr key={s.name}>
                  <td>{s.name}</td>
                  <td className="numeric">{s.answered}</td>
                  <td>
                    <span className="inline-bar">
                      <span className="bar-track" aria-hidden="true">
                        <span
                          className="bar-fill"
                          style={{ width: `${s.accuracy}%` }}
                        />
                      </span>
                      <strong>{s.accuracy}%</strong>
                    </span>
                  </td>
                  <td className="muted">{s.note || 'Sem destaque'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="two-column" style={{ marginTop: 24 }}>
        <Panel title="Distância até a aprovação">
          <EmptyState
            title="Estimativa ainda não disponível"
            description="Precisamos de metas verificadas, critérios de pontuação e resultados comparáveis. Não é possível concluir se você está no caminho da aprovação com estes exemplos."
          />
        </Panel>
        <Panel title="Como interpretar os números">
          <div className="form-content">
            <p className="muted">
              Nesta fase, os valores são exemplos fixos de interface. Não há
              cálculo de médias, nota estimada ou recomendação automática.
            </p>
            <p className="muted">
              Em uma próxima fase, cada indicador terá definição, fonte e
              cálculo testável. A distribuição dos alunos será observada, sem
              presumir uma curva normal.
            </p>
          </div>
        </Panel>
      </div>
      <DemoNote />
    </>
  );
}
