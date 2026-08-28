import styles from './BeforeAfterChart.module.css'

export interface BeforeAfterRow {
  name: string
  before: number | null
  after: number | null
}

interface BeforeAfterChartProps {
  rows: BeforeAfterRow[]
  beforeLabel: string
  afterLabel: string
}

// One grouped bar chart put growth of two percent next to trade of fifty, and
// the small bars vanished. Each indicator now gets its own row and its own
// scale, so the drop is readable whatever the size of the number.
function Bar({
  label,
  value,
  scale,
  signed,
  tone,
}: {
  label: string
  value: number | null
  scale: number
  signed: boolean
  tone: 'before' | 'after'
}) {
  const share = value === null ? 0 : Math.min(1, Math.abs(value) / scale)
  const width = `${(signed ? share * 50 : share * 100).toFixed(1)}%`
  const negative = (value ?? 0) < 0

  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={signed ? `${styles.track} ${styles.signed}` : styles.track}>
        <span
          className={`${styles.fill} ${tone === 'before' ? styles.before : styles.after} ${
            negative ? styles.negative : ''
          }`}
          style={signed ? { width, [negative ? 'right' : 'left']: '50%' } : { width }}
        />
      </span>
      <span className={styles.rowValue}>
        {value === null ? '' : `${value.toFixed(1)}%`}
      </span>
    </div>
  )
}

export default function BeforeAfterChart({
  rows,
  beforeLabel,
  afterLabel,
}: BeforeAfterChartProps) {
  return (
    <div className={styles.wrap}>
      {rows.map((row) => {
        const values = [row.before, row.after].filter((value): value is number => value !== null)
        const scale = Math.max(...values.map(Math.abs), 0.0001)
        const signed = values.some((value) => value < 0)
        const delta =
          row.before !== null && row.after !== null ? row.after - row.before : null
        return (
          <div key={row.name} className={styles.metric}>
            <header className={styles.head}>
              <span className={styles.name}>{row.name}</span>
              {delta === null ? null : (
                <span className={delta >= 0 ? styles.up : styles.down}>
                  {`${delta >= 0 ? '+' : '-'}${Math.abs(delta).toFixed(1)} pp`}
                </span>
              )}
            </header>
            <Bar label={beforeLabel} value={row.before} scale={scale} signed={signed} tone="before" />
            <Bar label={afterLabel} value={row.after} scale={scale} signed={signed} tone="after" />
          </div>
        )
      })}
    </div>
  )
}
