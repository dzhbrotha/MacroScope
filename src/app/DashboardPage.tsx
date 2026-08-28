import { Link } from 'react-router-dom'
import {
  Scale,
  TrendingUp,
  Briefcase,
  Gauge,
  Brain,
  House,
  Globe,
  LayoutGrid,
  ArrowRight,
} from 'lucide-react'
import { PageLayout, Skeleton } from '../shared/components'
import { useAsyncData } from '../shared/hooks/useAsyncData'
import { readQueryState } from '../shared/hooks/useQueryState'
import { getIndicatorForCountries } from '../backend/indicators'
import { INDICATORS } from '../backend/constants'
import { useCountries } from '../backend/CountriesProvider'
import type { IndicatorPoint } from '../backend/worldbank'
import { useI18n } from '../shared/i18n'
import type { TranslationKey } from '../shared/i18n'
import styles from './DashboardPage.module.css'

const modules: { to: string; icon: typeof Scale; title: TranslationKey; text: TranslationKey }[] = [
  { to: '/app/board', icon: LayoutGrid, title: 'nav.board', text: 'dash.board' },
  { to: '/app/sanctions', icon: Scale, title: 'nav.sanctions', text: 'dash.sanctions' },
  { to: '/app/inflation', icon: TrendingUp, title: 'nav.inflation', text: 'dash.inflation' },
  { to: '/app/unemployment', icon: Briefcase, title: 'nav.unemployment', text: 'dash.unemployment' },
  { to: '/app/quality-of-life', icon: Gauge, title: 'nav.quality', text: 'dash.quality' },
  { to: '/app/country', icon: Globe, title: 'nav.country', text: 'dash.country' },
  { to: '/app/ai-explainer', icon: Brain, title: 'nav.ai', text: 'dash.ai' },
  { to: '/app/property-lab', icon: House, title: 'nav.property', text: 'dash.property' },
]

const SNAPSHOT: { key: string; code: string; label: TranslationKey; unit: 'usd' | 'percent' }[] = [
  { key: 'gdp', code: INDICATORS.gdpPerCapita, label: 'ind.gdpPerCapita', unit: 'usd' },
  { key: 'inflation', code: INDICATORS.inflation, label: 'ind.inflation', unit: 'percent' },
  { key: 'unemployment', code: INDICATORS.unemployment, label: 'ind.unemployment', unit: 'percent' },
]

function latestOf(points: IndicatorPoint[] | undefined): IndicatorPoint | null {
  const facts = (points ?? []).filter((point) => point.value !== null)
  return facts.length > 0 ? facts[facts.length - 1] : null
}

function format(unit: 'usd' | 'percent', value: number): string {
  return unit === 'usd'
    ? `$${Math.round(value).toLocaleString('en-US')}`
    : `${value.toFixed(1)}%`
}

export default function DashboardPage() {
  const { t } = useI18n()
  const { nameOf } = useCountries()
  // The dashboard used to be a plain menu. It now opens with real numbers for
  // whichever country the reader looked at last.
  const country = readQueryState('country', 'KAZ')

  const { data, loading } = useAsyncData(
    () =>
      Promise.all(SNAPSHOT.map((item) => getIndicatorForCountries([country], item.code))).then(
        (series) =>
          Object.fromEntries(
            SNAPSHOT.map((item, index) => [item.key, series[index][country] ?? []]),
          ) as Record<string, IndicatorPoint[]>,
      ),
    [country],
  )

  const snapshot = data
    ? SNAPSHOT.map((item) => ({ ...item, latest: latestOf(data[item.key]) })).filter(
        (item) => item.latest !== null,
      )
    : []

  return (
    <PageLayout title={t('dash.title')} subtitle={t('dash.subtitle')}>
      {loading && snapshot.length === 0 ? (
        <Skeleton height={104} />
      ) : snapshot.length > 0 ? (
        <section className={styles.snapshot}>
          <div className={styles.snapshotHead}>
            <span className={styles.snapshotKicker}>{t('dash.snapshot')}</span>
            <strong className={styles.snapshotCountry}>{nameOf(country)}</strong>
          </div>
          <div className={styles.snapshotValues}>
            {snapshot.map((item) => (
              <div key={item.key} className={styles.snapshotItem}>
                <span className={styles.snapshotLabel}>{t(item.label)}</span>
                <strong className={styles.snapshotValue}>
                  {format(item.unit, item.latest?.value as number)}
                </strong>
                <span className={styles.snapshotYear}>{item.latest?.year}</span>
              </div>
            ))}
          </div>
          <Link to={`/app/board?country=${country}`} className={styles.snapshotLink}>
            {t('dash.openBoard')}
            <ArrowRight size={14} strokeWidth={1.75} />
          </Link>
        </section>
      ) : null}

      <div className={styles.grid}>
        {modules.map((module, index) => (
          <Link key={module.to} to={module.to} className={styles.card}>
            <span className={styles.cardHead}>
              <module.icon className={styles.icon} size={20} strokeWidth={1.5} />
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
            </span>
            <h3 className={styles.title}>{t(module.title)}</h3>
            <p className={styles.text}>{t(module.text)}</p>
            <span className={styles.open}>
              {t('dash.open')}
              <ArrowRight size={14} strokeWidth={1.75} />
            </span>
          </Link>
        ))}
      </div>
    </PageLayout>
  )
}
