import { Link } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useI18n } from '../shared/i18n'
import { usePrefersReducedMotion } from './motion'
import { useWorldInflation } from './worldInflation'
import styles from './TickerTape.module.css'

// A tape of the latest inflation reading for every economy, running under the
// opening screen the way a quote strip runs across a trading terminal. Each
// entry is a link into the inflation module for that country, so the tape is
// also the fastest way in.
//
// It stops under the pointer so an entry can be read and clicked, and for
// anyone who asked for less motion it does not move at all: it becomes a strip
// that scrolls by hand.

/** Seconds per entry: slow enough to read a code and a number in passing. */
const PACE = 0.55

export default function TickerTape() {
  const { t } = useI18n()
  const world = useWorldInflation()
  const reduced = usePrefersReducedMotion()

  if (!world) {
    return <div className={styles.tape} aria-hidden="true" />
  }

  // Only readings from the last two years with data, so a country whose series
  // stopped long ago does not sit on the tape as if it were current.
  const entries = world.countries
    .filter((country) => country.latest && country.latest.year >= world.lastYear - 1)
    .sort((a, b) => a.code.localeCompare(b.code))

  // The copy that closes the loop is taken out of the tab order as well as out
  // of the accessibility tree, so the keyboard does not visit every entry twice.
  const row = (copy: boolean) =>
    entries.map((country) => {
      const value = country.latest?.value as number
      const delta = country.previous === null ? null : value - country.previous
      const Arrow = delta !== null && delta < 0 ? ArrowDownRight : ArrowUpRight
      return (
        <Link
          key={country.code}
          to={`/app/inflation?country=${country.code}`}
          className={styles.entry}
          title={t('tape.open', { country: country.name })}
          tabIndex={copy ? -1 : undefined}
        >
          <span className={styles.code}>{country.code}</span>
          <span className={styles.value}>{`${value.toFixed(Math.abs(value) >= 100 ? 0 : 1)}%`}</span>
          {delta === null ? null : (
            <Arrow
              size={11}
              strokeWidth={2.4}
              className={delta < 0 ? styles.down : styles.up}
              aria-hidden="true"
            />
          )}
        </Link>
      )
    })

  return (
    <div className={styles.tape}>
      <span className={styles.label}>{t('tape.label', { year: world.lastYear })}</span>
      <div className={reduced ? `${styles.viewport} ${styles.still}` : styles.viewport}>
        {/* The row is laid down twice and slid by exactly one copy's width, so
            the loop has no seam. The copy is hidden from screen readers. */}
        <div
          className={styles.track}
          style={{ animationDuration: `${Math.max(40, entries.length * PACE)}s` }}
        >
          <div className={styles.row}>{row(false)}</div>
          {reduced ? null : (
            <div className={styles.row} aria-hidden="true">
              {row(true)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
