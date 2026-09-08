import {
  accuracyBy,
  totalAccuracy,
  sessionAnswers,
  type AnswerRecord,
  type Metrics,
  type MetricGroup,
} from '@/analytics/performance';
import type { PracticeSession } from '@/domain/practice';
import { Panel, EmptyState } from '@/components/ui/primitives';
const number = (n: number) =>
  n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
const percent = (n: number | null) =>
  n === null ? 'Sem dados' : `${number(n)}%`;
export function MetricSummary({ metrics: m }: { metrics: Metrics }) {
  return (
    <div className="practice-pad">
      <p>
        <strong>{percent(m.accuracy)}</strong> de acerto · {m.correct}/{m.total}{' '}
        questões
      </p>
      <p>
        {m.answered} respondidas · {m.incorrect} incorretas · {m.blank} em
        branco
      </p>
      <p>
        {m.uniqueQuestions} questões distintas · {m.uniqueAnswered} distintas
        respondidas · {m.sessions} sessões
      </p>
      <p>
        Tempo médio por questão:{' '}
        {m.averageTimeMs === null
          ? 'Sem dados'
          : `${number(m.averageTimeMs / 1000)} s`}
      </p>
      {m.total > 0 && m.smallSample && (
        <p className="data-note">
          Amostra pequena. Este resultado não demonstra domínio do conteúdo.
        </p>
      )}
    </div>
  );
}
export function MetricTable({
  title,
  groups,
}: {
  title: string;
  groups: MetricGroup[];
}) {
  return (
    <Panel title={title}>
      {groups.length === 0 ? (
        <EmptyState
          title="Sem dados neste recorte"
          description="Finalize uma prática para registrar resultados."
        />
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr>
                <th scope="col">Recorte</th>
                <th scope="col">Corretas / total</th>
                <th scope="col">Acerto</th>
                <th scope="col">Respondidas / distintas</th>
                <th scope="col">Tempo médio</th>
                <th scope="col">Amostra</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(({ key, label, metrics: m }) => (
                <tr key={key}>
                  <th scope="row">{label}</th>
                  <td>
                    {m.correct} / {m.total}
                  </td>
                  <td>{percent(m.accuracy)}</td>
                  <td>
                    {m.answered} / {m.uniqueAnswered}
                  </td>
                  <td>
                    {m.averageTimeMs === null
                      ? 'Sem dados'
                      : `${number(m.averageTimeMs / 1000)} s`}
                  </td>
                  <td>
                    {m.total === 0
                      ? 'Sem dados'
                      : m.smallSample
                        ? 'Pequena'
                        : `${m.uniqueAnswered} distintas`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
export function MetricReport({ rows }: { rows: AnswerRecord[] }) {
  return (
    <>
      <Panel title="Resultado geral">
        <MetricSummary metrics={totalAccuracy(rows)} />
        <p className="data-note">
          Acerto = corretas ÷ total, incluindo questões em branco. Repetições
          contam como tentativas. Tempo médio inclui brancos e tempos zero
          registrados. Não equivale à nota oficial.
        </p>
        <p className="data-note">
          Menos de 20 questões distintas respondidas: amostra pequena. Esse
          limite é uma cautela editorial, não um teste estatístico de domínio.
        </p>
      </Panel>
      {(['subject', 'topic', 'subtopic', 'difficulty'] as const).map(
        (dimension) => (
          <MetricTable
            key={dimension}
            title={
              {
                subject: 'Por disciplina',
                topic: 'Por tópico',
                subtopic: 'Por subtópico',
                difficulty: 'Por dificuldade',
              }[dimension]
            }
            groups={accuracyBy(rows, dimension)}
          />
        ),
      )}
    </>
  );
}
export function SessionAnalytics({ session }: { session: PracticeSession }) {
  let rows: AnswerRecord[];
  try {
    rows = sessionAnswers(session);
  } catch {
    return (
      <p role="alert" className="practice-pad">
        Não foi possível validar os dados desta sessão. Nenhum indicador foi
        calculado. Recarregue a página para tentar novamente.
      </p>
    );
  }
  return <MetricReport rows={rows} />;
}
