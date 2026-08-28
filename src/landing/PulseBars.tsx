import type { IndicatorPoint } from '../backend/worldbank'
import styles from './PulseBars.module.css'

// Growth by year, drawn from a zero line so the bad years point down. It fills
// the tall panel with something the reader can actually read, and it is a
// different picture from the inflation line in the story section.
export default function PulseBars({ points }: { points: IndicatorPoint[] }) {
  const facts = points.filter((point) => point.value !== null)
  if (facts.length < 4) return null

  const values = facts.map((point) => point.value as number)
  const reach = Math.max(...values.map(Math.abs)) || 1

  return (
    <div className={styles.wrap}>
      <div className={styles.bars}>
        {facts.map((point) => {
          const value = point.value as number
          const height = `${((Math.abs(value) / reach) * 50).toFixed(1)}%`
          return (
            <span key={point.year} className={styles.slot} title={`${point.year}: ${value.toFixed(1)}%`}>
              <i
                className={value >= 0 ? styles.up : styles.down}
                style={value >= 0 ? { height, bottom: '50%' } : { height, top: '50%' }}
              />
            </span>
          )
        })}
        <span className={styles.zero} />
      </div>
      <div className={styles.scale}>
        <span>{facts[0].year}</span>
        <span>{facts[facts.length - 1].year}</span>
      </div>
    </div>
  )
}
