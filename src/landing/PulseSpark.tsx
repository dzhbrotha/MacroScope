import type { IndicatorPoint } from '../backend/worldbank'
import styles from './PulseSpark.module.css'

// The story panel used to hold five hand sized bars that meant nothing. This
// draws the real series behind the words, with the high and the low marked so
// the shape can be read without an axis.
export default function PulseSpark({ points }: { points: IndicatorPoint[] }) {
  const facts = points.filter((point) => point.value !== null)
  if (facts.length < 4) return null

  const values = facts.map((point) => point.value as number)
  const low = Math.min(...values)
  const high = Math.max(...values)
  const span = high - low || 1
  const at = (index: number, value: number) => {
    const x = (index / (facts.length - 1)) * 100
    const y = 96 - ((value - low) / span) * 84
    return [x, y] as const
  }

  const line = facts.map((point, index) => at(index, point.value as number).join(',')).join(' ')
  const area = `0,100 ${line} 100,100`
  const peak = values.indexOf(high)
  const [peakX, peakY] = at(peak, high)
  const [lastX, lastY] = at(facts.length - 1, values[values.length - 1])

  return (
    <div className={styles.wrap}>
      <svg className={styles.chart} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polygon points={area} className={styles.area} />
        <polyline points={line} className={styles.line} vectorEffect="non-scaling-stroke" />
        <circle cx={peakX} cy={peakY} r="1.6" className={styles.peak} vectorEffect="non-scaling-stroke" />
        <circle cx={lastX} cy={lastY} r="1.6" className={styles.last} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className={styles.scale}>
        <span>{facts[0].year}</span>
        <span>{`${high.toFixed(1)}% ${facts[peak].year}`}</span>
        <span>{facts[facts.length - 1].year}</span>
      </div>
    </div>
  )
}
