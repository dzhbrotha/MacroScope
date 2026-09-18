import { FIRST_YEAR } from '../backend/worldbank'
import { buildScenarios } from '../app/modules/quality/audit'
import { navItems } from '../app/navItems'
import { useI18n } from '../shared/i18n'
import type { TranslationKey } from '../shared/i18n'
import { useCountUp, useSeenOnce } from './motion'
import type { HeroData } from './useHeroData'
import styles from './StatsBand.module.css'

// Four numbers under the opening screen, each taken from the product itself
// rather than typed in: the economies the World Bank list holds, the years our
// series reach back, the weightings every ranking is tested under, and the
// modules anyone can open without an account. If one of them changes in the
// code, the landing page changes with it.

const SCENARIOS = buildScenarios().length
// The dashboard is the front door, not a module.
const MODULES = navItems.filter((item) => item.to !== '/app').length

interface Item {
  value: number | null
  label: TranslationKey
}

function Stat({ value, label, start, index }: Item & { start: boolean; index: number }) {
  const { t } = useI18n()
  const shown = useCountUp(value ?? 0, start && value !== null, 1200 + index * 150)
  return (
    <div className={styles.stat}>
      <p className={styles.value}>{value === null ? '—' : shown}</p>
      <p className={styles.label}>{t(label, { from: FIRST_YEAR })}</p>
    </div>
  )
}

export default function StatsBand({ data }: { data: HeroData }) {
  const { ref, seen } = useSeenOnce<HTMLDivElement>()
  const latestYear = data.countries.reduce(
    (latest, country) => Math.max(latest, country.latest?.year ?? 0),
    0,
  )

  const items: Item[] = [
    { value: data.economies, label: 'stats.economies' },
    { value: latestYear > 0 ? latestYear - FIRST_YEAR + 1 : null, label: 'stats.years' },
    { value: SCENARIOS, label: 'stats.weightings' },
    { value: MODULES, label: 'stats.modules' },
  ]

  return (
    <section className={styles.band}>
      <div ref={ref} className={styles.grid}>
        {items.map((item, index) => (
          <Stat key={item.label} {...item} start={seen} index={index} />
        ))}
      </div>
    </section>
  )
}
