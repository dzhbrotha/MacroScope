import { useRef } from 'react'
import {
  Card,
  CountrySelect,
  EmptyState,
  ErrorState,
  ExportBar,
  InsightList,
  LoadingState,
  PageLayout,
  Tooltip,
} from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { useQueryState } from '../../../shared/hooks/useQueryState'
import { getIndicator } from '../../../backend/indicators'
import { INDICATORS } from '../../../backend/constants'
import { useCountries } from '../../../backend/CountriesProvider'
import type { IndicatorPoint } from '../../../backend/worldbank'
import IndicatorLineChart from '../../../shared/charts/IndicatorLineChart'
import { downloadChartPng, downloadCsv } from '../../../shared/lib/exportData'
import { buildInsights } from '../../../shared/lib/insights'
import { useI18n } from '../../../shared/i18n'
import type { TranslationKey } from '../../../shared/i18n'
import styles from './CountryProfilePage.module.css'

type Unit = 'usd' | 'percent' | 'years'

const CARDS: { key: string; code: string; label: TranslationKey; desc: TranslationKey; unit: Unit }[] = [
  { key: 'gdpPerCapita', code: INDICATORS.gdpPerCapita, label: 'ind.gdpPerCapita', desc: 'ind.gdpPerCapita.desc', unit: 'usd' },
  { key: 'gdpGrowth', code: INDICATORS.gdpGrowth, label: 'ind.gdpGrowth', desc: 'ind.gdpGrowth.desc', unit: 'percent' },
  { key: 'inflation', code: INDICATORS.inflation, label: 'ind.inflation', desc: 'ind.inflation.desc', unit: 'percent' },
  { key: 'unemployment', code: INDICATORS.unemployment, label: 'ind.unemployment', desc: 'ind.unemployment.desc', unit: 'percent' },
  { key: 'lifeExpectancy', code: INDICATORS.lifeExpectancy, label: 'ind.lifeExpectancy', desc: 'ind.lifeExpectancy.desc', unit: 'years' },
  { key: 'tradePercentGdp', code: INDICATORS.tradePercentGdp, label: 'ind.trade', desc: 'ind.trade.desc', unit: 'percent' },
]

function latestOf(points: IndicatorPoint[] | undefined): IndicatorPoint | null {
  const facts = (points ?? []).filter((point) => point.value !== null)
  return facts.length > 0 ? facts[facts.length - 1] : null
}

function formatStat(unit: Unit, value: number): string {
  if (unit === 'usd') return `$${Math.round(value).toLocaleString('en-US')}`
  if (unit === 'years') return `${value.toFixed(1)}`
  return `${value.toFixed(1)}%`
}

async function loadProfile(countryCode: string): Promise<Record<string, IndicatorPoint[]>> {
  const series = await Promise.all(CARDS.map((card) => getIndicator(countryCode, card.code)))
  return Object.fromEntries(CARDS.map((card, index) => [card.key, series[index]]))
}

interface ChartCardProps {
  title: string
  points: IndicatorPoint[]
  unit: string
  seriesName: string
  fileBase: string
}

function ChartCard({ title, points, unit, seriesName, fileBase }: ChartCardProps) {
  const holder = useRef<HTMLDivElement>(null)

  function exportCsv() {
    downloadCsv(`${fileBase}.csv`, [
      ['year', seriesName],
      ...points.map((point) => [point.year, point.value]),
    ])
  }

  async function exportPng() {
    try {
      await downloadChartPng(holder.current, `${fileBase}.png`, '#0b213e')
    } catch (error) {
      console.warn('Chart export failed:', error)
    }
  }

  return (
    <Card title={title}>
      <div ref={holder}>
        <IndicatorLineChart data={points} unit={unit} seriesName={seriesName} />
      </div>
      <div className={styles.exportRow}>
        <ExportBar onCsv={exportCsv} onPng={exportPng} />
      </div>
    </Card>
  )
}

export default function CountryProfilePage() {
  const { t } = useI18n()
  const { nameOf } = useCountries()
  const [countryCode, setCountryCode] = useQueryState('country', 'KAZ')
  const countryLabel = nameOf(countryCode)

  const { data, loading, error, reload } = useAsyncData(
    () => loadProfile(countryCode),
    [countryCode],
  )

  const hasData =
    data !== null && Object.values(data).some((series) => latestOf(series) !== null)

  const insights = data
    ? buildInsights(data.inflation ?? [], t, { format: (value) => `${value.toFixed(1)}%` })
    : []

  return (
    <PageLayout title={t('nav.country')} subtitle={t('country.subtitle')}>
      <div className={styles.controls}>
        <CountrySelect label={t('common.country')} value={countryCode} onChange={setCountryCode} />
      </div>

      {loading ? (
        <LoadingState label={t('country.loading', { country: countryLabel })} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !hasData || data === null ? (
        <EmptyState message={t('country.empty', { country: countryLabel })} />
      ) : (
        <>
          <div className={styles.stats}>
            {CARDS.map((card) => {
              const latest = latestOf(data[card.key])
              return (
                <div key={card.key} className={styles.stat}>
                  <span className={styles.statLabel}>
                    {t(card.label)}
                    <Tooltip text={t(card.desc)} label={t(card.label)} />
                  </span>
                  <span className={styles.statValue}>
                    {latest === null ? t('common.noData') : formatStat(card.unit, latest.value as number)}
                  </span>
                  {latest === null ? null : (
                    <span className={styles.statHint}>{t('common.latest', { year: latest.year })}</span>
                  )}
                </div>
              )
            })}
          </div>

          {insights.length > 0 ? (
            <InsightList title={t('common.insights')} items={insights} />
          ) : null}

          <ChartCard
            title={t('country.chartGdp', { country: countryLabel })}
            points={data.gdpPerCapita ?? []}
            unit=""
            seriesName={t('ind.gdpPerCapita')}
            fileBase={`macroscope-${countryCode}-gdp-per-capita`}
          />
          <ChartCard
            title={t('country.chartInflation', { country: countryLabel })}
            points={data.inflation ?? []}
            unit="%"
            seriesName={t('ind.inflation')}
            fileBase={`macroscope-${countryCode}-inflation`}
          />
          <ChartCard
            title={t('country.chartUnemployment', { country: countryLabel })}
            points={data.unemployment ?? []}
            unit="%"
            seriesName={t('ind.unemployment')}
            fileBase={`macroscope-${countryCode}-unemployment`}
          />
        </>
      )}
    </PageLayout>
  )
}
