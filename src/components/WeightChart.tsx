import { useEffect, useRef, useState } from 'react';
import type { WeightEntry } from '../lib/profile';
import { formatDay } from './MenuView';

interface Props {
  entries: WeightEntry[];
  target: number | null;
}

const PAD = { top: 20, right: 12, bottom: 32, left: 44 };

/** Largeur réelle du conteneur, pour que les textes du graphique gardent leur taille. */
function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

export function WeightChart({ entries, target }: Props) {
  const [ref, W] = useWidth();
  const H = Math.round(Math.min(300, Math.max(200, W * 0.36)));
  return <div ref={ref}>{entries.length < 2 ? <EmptyChart /> : <Chart entries={entries} target={target} W={W} H={H} />}</div>;
}

function EmptyChart() {
  return (
    <div className="chart-empty">
      <span aria-hidden>📈</span>
      <p>Ajoutez au moins deux pesées pour voir votre courbe.</p>
    </div>
  );
}

function Chart({ entries, target, W, H }: Props & { W: number; H: number }) {

  const times = entries.map((e) => new Date(e.date + 'T12:00:00').getTime());
  const values = entries.map((e) => e.kg);
  const all = target ? [...values, target] : values;
  const minY = Math.floor(Math.min(...all) - 1);
  const maxY = Math.ceil(Math.max(...all) + 1);
  const t0 = times[0];
  const t1 = times[times.length - 1];

  const x = (t: number) => PAD.left + ((t - t0) / (t1 - t0 || 1)) * (W - PAD.left - PAD.right);
  const y = (v: number) => PAD.top + (1 - (v - minY) / (maxY - minY || 1)) * (H - PAD.top - PAD.bottom);

  const points = entries.map((e, i) => [x(times[i]), y(e.kg)] as const);
  const line = points.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${H - PAD.bottom} L${points[0][0].toFixed(1)},${H - PAD.bottom} Z`;

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => minY + ((maxY - minY) * i) / ticks);
  const labelIdx = [...new Set([0, Math.floor((entries.length - 1) / 2), entries.length - 1])];

  const first = values[0];
  const last = values[values.length - 1];
  const diff = last - first;

  return (
    <figure className="chart">
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Évolution du poids de ${first} kg à ${last} kg`}>
        <defs>
          <linearGradient id="wfill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--orange)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--orange)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="grid" />
            <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" className="axis">
              {v.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}
            </text>
          </g>
        ))}
        {target && (
          <g>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(target)} y2={y(target)} className="target" />
            <text x={W - PAD.right} y={y(target) - 6} textAnchor="end" className="target-label">
              Objectif {target} kg
            </text>
          </g>
        )}
        <path d={area} fill="url(#wfill)" />
        <path d={line} className="line" />
        {points.map(([px, py], i) => (
          <circle key={entries[i].date} cx={px} cy={py} r={4} className="point">
            <title>
              {formatDay(entries[i].date, { day: 'numeric', month: 'long' })} : {entries[i].kg} kg
            </title>
          </circle>
        ))}
        {labelIdx.map((i) => (
          <text key={i} x={points[i][0]} y={H - 10} textAnchor={i === 0 ? 'start' : i === entries.length - 1 ? 'end' : 'middle'} className="axis">
            {formatDay(entries[i].date, { day: 'numeric', month: 'short' })}
          </text>
        ))}
      </svg>
      <figcaption>
        <strong className={diff < 0 ? 'down' : diff > 0 ? 'up' : ''}>
          {diff > 0 ? '+' : ''}
          {diff.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} kg
        </strong>{' '}
        depuis le {formatDay(entries[0].date, { day: 'numeric', month: 'long' })}
        {target && (
          <>
            {' '}
            · encore {Math.abs(last - target).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} kg avant l’objectif
          </>
        )}
      </figcaption>
    </figure>
  );
}
