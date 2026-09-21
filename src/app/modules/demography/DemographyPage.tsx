import { useMemo } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import {
  AnimatedNumber,
  CountrySelect,
  EmptyState,
  ErrorState,
  PageLayout,
  Skeleton,
  SourceNote,
  Tooltip as InfoTip,
} from '../../../shared/components'
import { PinButton } from '../../../shared/watchlist'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { useQueryState } from '../../../shared/hooks/useQueryState'
import { getIndicatorForCountries } from '../../../backend/indicators'
import { INDICATORS } from '../../../backend/constants'
import { useCountries } from '../../../backend/CountriesProvider'
import type { IndicatorPoint } from '../../../backend/worldbank'
import MiniAreaChart from '../../../shared/charts/MiniAreaChart'
import ChartControls from '../../../shared/charts/ChartControls'
import { CHART } from '../../../shared/charts/chartStyle'
import { applyView, isRange, startYearOf } from '../../../shared/charts/transform'
import { useI18n } from '../../../shared/i18n'
import type { TranslationKey } from '../../../shared/i18n'
import styles from './DemographyPage.module.css'

// Who is going to be working in twenty years.
//
// The dependency ratio leads because it is the one figure here that decides
// something: how many people outside working age each hundred inside it have
// to carry. The rest of the panels are what moves it, and they move slowly
// enough that the trend is the story rather than the latest reading.

type Unit = 'people' | 'percent' | 'perWoman' | 'ratio'

interface Panel {
  key: string
  code: string
  label: TranslationKey
  desc: TranslationKey
  unit: Unit
  color: string
}

const PANELS: Panel[] = [
  { key: 'dependency', code: INDICATORS.dependency, label: 'demo.dependency', desc: 'demo.dependency.desc', unit: 'ratio', color: CHART.accent },
  { key: 'population', code: INDICATORS.population, label: 'demo.population', desc: 'demo.population.desc', unit: 'people', color: CHART.text },
  { key: 'growth', code: INDICATORS.populationGrowth, label: 'demo.growth', desc: 'demo.growth.desc', unit: 'percent', color: CHART.accentSoft },
  { key: 'fertility', code: INDICATORS.fertility, label: 'demo.fertility', desc: 'demo.fertility.desc', unit: 'perWoman', color: CHART.axis },
  { key: 'older', code: INDICATORS.overSixtyFive, label: 'demo.older', desc: 'demo.older.desc', unit: 'percent', color: CHART.accentFill },
  { key: 'urban', code: INDICATORS.urbanShare, label: 'demo.urban', desc: 'demo.urban.desc', unit: 'percent', color: CHART.accentSoft },
]

/** Births per woman at which a population replaces itself, roughly. */
const REPLACEMENT = 2.1

function format(unit: Unit, value: number): string {
  if (unit === 'people') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} M`
    return `${Math.round(value / 1000)} K`
  }
  if (unit === 'percent') return `${value.toFixed(1)}%`
  if (unit === 'perWoman') return value.toFixed(2)
  return value.toFixed(1)
}

function factsOf(points: IndicatorPoint[]): IndicatorPoint[] {
  return points.filter((point) => point.value !== null)
}

async function loadDemography(code: string): Promise<Record<string, IndicatorPoint[]>> {
  const series = await Promise.all(
    PANELS.map((panel) => getIndicatorForCountries([code], panel.code)),
  )
  return Object.fromEntries(PANELS.map((panel, index) => [panel.key, series[index][code] ?? []]))
}

export default function DemographyPage() {
  const { t } = useI18n()
  const { nameOf } = useCountries()
  const [country, setCountry] = useQueryState('country', 'KAZ')
  const [rangeRaw, setRange] = useQueryState('range', 'all')
  const range = isRange(rangeRaw) ? rangeRaw : 'all'
  const label = nameOf(country)

  const { data, loading, error, reload } = useAsyncData(() => loadDemography(country), [country])

  const panels = useMemo(() => {
    if (!data) return []
    return PANELS.map((panel) => {
      const all = data[panel.key] ?? []
      const view = applyView(all, startYearOf([all], range), 'level')
      const facts = factsOf(view)
      const latest = facts.length > 0 ? facts[facts.length - 1] : null
      const first = facts.length > 1 ? facts[0] : null
      const delta =
        latest && first ? (latest.value as number) - (first.value as number) : null
      return { panel, view, latest, first, delta, span: facts }
    })
  }, [data, range])

  const lead = panels[0]
  const fertility = panels.find((item) => item.panel.key === 'fertility')
  const hasData = panels.some((item) => item.latest !== null)

  return (
    <PageLayout title={t('nav.demography')} subtitle={t('demo.subtitle')} wide>
      <div className={styles.controls}>
        <CountrySelect label={t('common.country')} value={country} onChange={setCountry} />
        <PinButton code={country} />
        <div className={styles.spacer} />
        <ChartControls range={range} onRange={setRange} compact />
      </div>

      {loading ? (
        <>
          <Skeleton height={148} />
          <div className={styles.board}>
            <Skeleton height={196} count={6} />
          </div>
        </>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !hasData ? (
        <EmptyState message={t('demo.empty', { country: label })} />
      ) : (
        <>
          {lead && lead.latest ? (
            <section className={styles.lead}>
              <div>
                <span className={styles.leadKicker}>{t('demo.leadKicker')}</span>
                <strong className={styles.leadValue}>
                  <AnimatedNumber
                    value={lead.latest.value as number}
                    format={(shown) => shown.toFixed(1)}
                  />
                </strong>
                <span className={styles.leadUnit}>
                  {t('demo.leadUnit', { year: lead.latest.year })}
                </span>
              </div>
              <p className={styles.leadText}>
                {lead.first && lead.delta !== null
                  ? t('demo.leadChange', {
                      from: lead.first.year,
                      was: (lead.first.value as number).toFixed(1),
                      delta: `${lead.delta >= 0 ? '+' : ''}${lead.delta.toFixed(1)}`,
                    })
                  : t('demo.leadPlain')}
                {fertility?.latest
                  ? ' ' +
                    t(
                      (fertility.latest.value as number) < REPLACEMENT
                        ? 'demo.belowReplacement'
                        : 'demo.aboveReplacement',
                      { value: (fertility.latest.value as number).toFixed(2) },
                    )
                  : ''}
              </p>
            </section>
          ) : null}

          <div className={styles.board}>
            {panels.map(({ panel, view, latest, delta }) => {
              const rising = delta !== null && delta >= 0
              const Arrow = delta === null ? Minus : rising ? ArrowUpRight : ArrowDownRight
              return (
                <article key={panel.key} className={styles.panel}>
                  <header className={styles.head}>
                    <span className={styles.label}>
                      {t(panel.label)}
                      <InfoTip text={t(panel.desc)} label={t(panel.label)} />
                    </span>
                  </header>
                  <div className={styles.readout}>
                    <strong className={styles.value}>
                      {latest === null ? t('common.noData') : format(panel.unit, latest.value as number)}
                    </strong>
                    {delta === null ? null : (
                      <span className={styles.delta} title={t('demo.deltaHint')}>
                        <Arrow size={13} strokeWidth={2.25} />
                        {format(panel.unit === 'people' ? 'people' : panel.unit, Math.abs(delta))}
                      </span>
                    )}
                  </div>
                  <div className={styles.chart}>
                    <MiniAreaChart
                      data={view}
                      color={panel.color}
                      name={t(panel.label)}
                      syncId="demography"
                      height={128}
                      format={(shown) => format(panel.unit, shown)}
                    />
                  </div>
                </article>
              )
            })}
          </div>

          <p className={styles.note}>{t('demo.note')}</p>
          <SourceNote codes={PANELS.map((panel) => panel.code)} />
        </>
      )}
    </PageLayout>
  )
}
