import type { IndicatorPoint } from '../../backend/worldbank'
import styles from './StatCard.module.css'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  /** Draws the history behind the figure, so the number carries its own shape. */
  series?: IndicatorPoint[]
  color?: string
}

function Spark({ series, color }: { series: IndicatorPoint[]; color: string }) {
  const facts = series.filter((point) => point.value !== null)
  if (facts.length < 3) return null
  const values = facts.map((point) => point.value as number)
  const low = Math.min(...values)
  const span = Math.max(...values) - low || 1
  const line = facts
    .map((point, index) => {
      const x = (index / (facts.length - 1)) * 100
      const y = 30 - (((point.value as number) - low) / span) * 26
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
  return (
    <svg className={styles.spark} viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

export default function StatCard({ label, value, hint, series, color }: StatCardProps) {
  const withSpark = Boolean(series && color)
  return (
    <div className={withSpark ? `${styles.stat} ${styles.withSpark}` : styles.stat}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
      {withSpark ? <Spark series={series as IndicatorPoint[]} color={color as string} /> : null}
    </div>
  )
}
