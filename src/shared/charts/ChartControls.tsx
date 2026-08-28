import { useI18n } from '../i18n'
import type { TranslationKey } from '../i18n'
import { RANGES, UNITS } from './transform'
import type { RangeKey, UnitsKey } from './transform'
import styles from './ChartControls.module.css'

const RANGE_LABEL: Record<RangeKey, TranslationKey> = {
  '10': 'chart.range10',
  '25': 'chart.range25',
  all: 'chart.rangeAll',
}

const UNITS_LABEL: Record<UnitsKey, TranslationKey> = {
  level: 'chart.level',
  index: 'chart.index',
  change: 'chart.change',
}

interface ChartControlsProps {
  range: RangeKey
  onRange: (value: RangeKey) => void
  /** Omit the pair to show a range switch on its own, as the forecast does. */
  units?: UnitsKey
  onUnits?: (value: UnitsKey) => void
  /** The year the index is rebased to, shown under the chart. */
  baseYear?: number | null
}

export default function ChartControls({
  range,
  onRange,
  units,
  onUnits,
  baseYear = null,
}: ChartControlsProps) {
  const { t } = useI18n()

  return (
    <div className={styles.wrap}>
      <div className={styles.group}>
        <span className={styles.label}>{t('chart.range')}</span>
        <div className={styles.buttons}>
          {RANGES.map((item) => (
            <button
              key={item}
              type="button"
              className={item === range ? `${styles.button} ${styles.on}` : styles.button}
              onClick={() => onRange(item)}
              aria-pressed={item === range}
            >
              {t(RANGE_LABEL[item])}
            </button>
          ))}
        </div>
      </div>

      {units && onUnits ? (
        <div className={styles.group}>
          <span className={styles.label}>{t('chart.units')}</span>
          <div className={styles.buttons}>
            {UNITS.map((item) => (
              <button
                key={item}
                type="button"
                className={item === units ? `${styles.button} ${styles.on}` : styles.button}
                onClick={() => onUnits(item)}
                aria-pressed={item === units}
              >
                {t(UNITS_LABEL[item])}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {units === 'index' && baseYear !== null ? (
        <p className={styles.note}>{t('chart.noteIndex', { year: baseYear })}</p>
      ) : units === 'change' ? (
        <p className={styles.note}>{t('chart.noteChange')}</p>
      ) : null}
    </div>
  )
}
