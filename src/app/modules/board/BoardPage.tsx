import { useMemo } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import {
  AnimatedNumber,
  CountrySelect,
  EmptyState,
  ErrorState,
  PageLayout,
  Skeleton,
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
import styles from './BoardPage.module.css'

type Unit = 'usd' | 'percent'

interface PanelSpec {
  key: string
  code: string
  label: TranslationKey
  desc: TranslationKey
  unit: Unit
  color: string
  /** Whether a rising line is the good news, used only to colour the change. */
  goodWhenUp: boolean
}

const PANELS: PanelSpec[] = [
  {
    key: 'gdpPerCapita',
    code: INDICATORS.gdpPerCapita,
    label: 'ind.gdpPerCapita',
    desc: 'ind.gdpPerCapita.desc',
    unit: 'usd',
    color: CHART.accent,
    goodWhenUp: true,
  },
  {
    key: 'inflation',
    code: INDICATORS.inflation,
    label: 'ind.inflation',
    desc: 'ind.inflation.desc',
    unit: 'percent',
    color: CHART.cyan,
    goodWhenUp: false,
  },
  {
    key: 'unemployment',
    code: INDICATORS.unemployment,
    label: 'ind.unemployment',
    desc: 'ind.unemployment.desc',
    unit: 'percent',
    color: CHART.positive,
    goodWhenUp: false,
  },
  {
    key: 'tradePercentGdp',
    code: INDICATORS.tradePercentGdp,
    label: 'ind.trade',
    desc: 'ind.trade.desc',
    unit: 'percent',
    color: CHART.accentSoft,
    goodWhenUp: true,
  },
]

function formatValue(unit: Unit, value: number): string {
  return unit === 'usd'
    ? `$${Math.round(value).toLocaleString('en-US')}`
    : `${value.toFixed(1)}%`
}

function formatDelta(unit: Unit, value: number): string {
  const sign = value >= 0 ? '+' : '-'
  const size = Math.abs(value)
  return unit === 'usd'
    ? `${sign}$${Math.round(size).toLocaleString('en-US')}`
    : `${sign}${size.toFixed(1)} pp`
}

function factsOf(points: IndicatorPoint[]): IndicatorPoint[] {
  return points.filter((point) => point.value !== null)
}

async function loadBoard(code: string): Promise<Record<string, IndicatorPoint[]>> {
  const series = await Promise.all(
    PANELS.map((panel) => getIndicatorForCountries([code], panel.code)),
  )
  return Object.fromEntries(PANELS.map((panel, index) => [panel.key, series[index][code] ?? []]))
}

export default function BoardPage() {
  const { t } = useI18n()
  const { nameOf } = useCountries()
  const [country, setCountry] = useQueryState('country', 'KAZ')
  const [rangeRaw, setRange] = useQueryState('range', '25')
  const range = isRange(rangeRaw) ? rangeRaw : '25'
  const label = nameOf(country)

  const { data, loading, error, reload } = useAsyncData(() => loadBoard(country), [country])

  // One range covers all four panels, so the eye compares the same window
  // everywhere and the synced crosshair lands on the same year.
  const panels = useMemo(() => {
    if (!data) return []
    return PANELS.map((panel) => {
      const all = data[panel.key] ?? []
      const startYear = startYearOf([all], range)
      const view = applyView(all, startYear, 'level')
      const facts = factsOf(view)
      const latest = facts.length > 0 ? facts[facts.length - 1] : null
      const previous = facts.length > 1 ? facts[facts.length - 2] : null
      const delta =
        latest && previous ? (latest.value as number) - (previous.value as number) : null
      return { panel, view, latest, delta, span: facts }
    })
  }, [data, range])

  const hasData = panels.some((item) => item.latest !== null)

  return (
    <PageLayout title={t('nav.board')} subtitle={t('board.subtitle')} wide>
      <div className={styles.controls}>
        <CountrySelect label={t('common.country')} value={country} onChange={setCountry} />
        <PinButton code={country} />
        <div className={styles.spacer} />
        <ChartControls range={range} onRange={setRange} compact />
      </div>

      {loading ? (
        <>
          <p className={styles.note}>{t('board.loading', { country: label })}</p>
          <div className={styles.board}>
            <Skeleton height={214} count={4} />
          </div>
        </>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !hasData ? (
        <EmptyState message={t('board.empty', { country: label })} />
      ) : (
        <>
          <div className={styles.board}>
            {panels.map(({ panel, view, latest, delta, span }) => {
              const rising = delta !== null && delta >= 0
              const good = delta === null ? null : rising === panel.goodWhenUp
              const Arrow = delta === null ? Minus : rising ? ArrowUpRight : ArrowDownRight
              return (
                <article key={panel.key} className={styles.panel}>
                  <header className={styles.head}>
                    <span className={styles.label}>
                      {t(panel.label)}
                      <InfoTip text={t(panel.desc)} label={t(panel.label)} />
                    </span>
                    <span className={styles.years}>
                      {span.length > 1 ? `${span[0].year} — ${span[span.length - 1].year}` : ''}
                    </span>
                  </header>

                  <div className={styles.readout}>
                    <strong className={styles.value}>
                      {latest === null ? (
                        t('common.noData')
                      ) : (
                        <AnimatedNumber
                          value={latest.value as number}
                          format={(shown) => formatValue(panel.unit, shown)}
                        />
                      )}
                    </strong>
                    {delta === null ? null : (
                      <span
                        className={`${styles.delta} ${good ? styles.good : styles.bad}`}
                        title={t('board.deltaHint')}
                      >
                        <Arrow size={13} strokeWidth={2.25} />
                        {formatDelta(panel.unit, delta)}
                      </span>
                    )}
                  </div>

                  <div className={styles.chart}>
                    <MiniAreaChart
                      data={view}
                      color={panel.color}
                      name={t(panel.label)}
                      syncId="board"
                      format={(shown) => formatValue(panel.unit, shown)}
                    />
                  </div>
                </article>
              )
            })}
          </div>

          <p className={styles.note}>{t('board.note')}</p>
        </>
      )}
    </PageLayout>
  )
}
