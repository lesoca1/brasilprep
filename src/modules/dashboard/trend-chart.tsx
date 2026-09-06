import type { DemoTrack } from '@/data/demo';
export function TrendChart({ track }: { track: DemoTrack }) {
  const positions = [48, 200, 352, 504];
  const points = track.trend.map(
    (d, i) => `${positions[i]},${190 - (d.accuracy - 40) * 3}`,
  );
  const target = Number(track.target.replace('%', '').replace(',', '.'));
  const targetY = 190 - (target - 40) * 3;
  return (
    <figure className="trend">
      <svg
        viewBox="0 0 550 226"
        role="img"
        aria-label={`Exemplo fictício de acerto mensal na ${track.exam}. ${track.trend.map((d) => `${d.month}: ${d.accuracy}%`).join('. ')}. Meta ilustrativa: ${track.target}.`}
      >
        {[40, 60, 80, 100].map((v) => (
          <g key={v}>
            <line
              x1="42"
              x2="514"
              y1={190 - (v - 40) * 3}
              y2={190 - (v - 40) * 3}
              className="chart-grid"
            />
            <text x="0" y={194 - (v - 40) * 3} className="chart-label">
              {v}
            </text>
          </g>
        ))}
        <line
          x1="42"
          x2="514"
          y1={targetY}
          y2={targetY}
          className="chart-target"
        />
        <polyline points={points.join(' ')} className="chart-line" />
        {track.trend.map((d, i) => (
          <g key={d.month}>
            <circle
              cx={positions[i]}
              cy={190 - (d.accuracy - 40) * 3}
              r="4"
              className="chart-point"
            />
            <text
              x={positions[i]}
              y={177 - (d.accuracy - 40) * 3}
              textAnchor="middle"
              className="chart-value"
            >
              {d.accuracy}%
            </text>
            <text
              x={positions[i]}
              y="222"
              textAnchor="middle"
              className="chart-label"
            >
              {d.month}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="chart-legend">
        <span>
          <i className="legend-line" />
          Acerto mensal ilustrativo
        </span>
        <span>
          <i className="legend-line dashed" />
          Meta de prática {track.target}
        </span>
      </figcaption>
    </figure>
  );
}
