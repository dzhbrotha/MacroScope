import { useRef, useState } from 'react'
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
import { getIndicatorForCountries } from '../../../backend/indicators'
import { INDICATORS } from '../../../backend/constants'
import { useCountries } from '../../../backend/CountriesProvider'
import type { IndicatorPoint } from '../../../backend/worldbank'
import IndicatorLineChart from '../../../shared/charts/IndicatorLineChart'
import MultiLineChart from '../../../shared/charts/MultiLineChart'
import { SERIES_COLORS } from '../../../shared/charts/chartStyle'
import ChartControls from '../../../shared/charts/ChartControls'
import { PinButton } from '../../../shared/watchlist'
import { applyView, startYearOf, unitFor } from '../../../shared/charts/transform'
import type { RangeKey, UnitsKey } from '../../../shared/charts/transform'
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

const CHARTS: { key: string; title: TranslationKey; unit: string; file: string }[] = [
  { key: 'gdpPerCapita', title: 'country.chartGdp', unit: '', file: 'gdp-per-capita' },
  { key: 'inflation', title: 'country.chartInflation', unit: '%', file: 'inflation' },
  { key: 'unemployment', title: 'country.chartUnemployment', unit: '%', file: 'unemployment' },
]

type Profile = Record<string, Record<string, IndicatorPoint[]>>

function latestOf(points: IndicatorPoint[] | undefined): IndicatorPoint | null {
  const facts = (points ?? []).filter((point) => point.value !== null)
  return facts.length > 0 ? facts[facts.length - 1] : null
}

function formatStat(unit: Unit, value: number): string {
  if (unit === 'usd') return `$${Math.round(value).toLocaleString('en-US')}`
  if (unit === 'years') return `${value.toFixed(1)}`
  return `${value.toFixed(1)}%`
}

function formatDelta(unit: Unit, value: number): string {
  const sign = value >= 0 ? '+' : '-'
  const size = Math.abs(value)
  if (unit === 'usd') return `${sign}$${Math.round(size).toLocaleString('en-US')}`
  if (unit === 'years') return `${sign}${size.toFixed(1)}`
  return `${sign}${size.toFixed(1)} pp`
}

async function loadProfile(codes: string[]): Promise<Profile> {
  const series = await Promise.all(
    CARDS.map((card) => getIndicatorForCountries(codes, card.code)),
  )
  return Object.fromEntries(CARDS.map((card, index) => [card.key, series[index]]))
}

interface ChartCardProps {
  title: string
  primary: { name: string; points: IndicatorPoint[] }
  secondary: { name: string; points: IndicatorPoint[] } | null
  unit: string
  fileBase: string
}

function ChartCard({ title, primary, secondary, unit, fileBase }: ChartCardProps) {
  const holder = useRef<HTMLDivElement>(null)
  // Each chart keeps its own range and units: the reader usually wants a long
  // view of income and a short view of prices on the same page.
  const [range, setRange] = useState<RangeKey>('all')
  const [units, setUnits] = useState<UnitsKey>('level')

  const sources = secondary ? [primary.points, secondary.points] : [primary.points]
  const startYear = startYearOf(sources, range)
  const primaryView = applyView(primary.points, startYear, units)
  const secondaryView = secondary ? applyView(secondary.points, startYear, units) : null
  const viewUnit = unitFor(units, unit)
  const baseYear = primaryView.find((point) => point.value !== null)?.year ?? null

  function exportCsv() {
    if (secondary) {
      const years = new Set<number>()
      primary.points.forEach((point) => years.add(point.year))
      secondary.points.forEach((point) => years.add(point.year))
      downloadCsv(`${fileBase}.csv`, [
        ['year', primary.name, secondary.name],
        ...[...years]
          .sort((a, b) => a - b)
          .map((year) => [
            year,
            primary.points.find((point) => point.year === year)?.value ?? null,
            secondary.points.find((point) => point.year === year)?.value ?? null,
          ]),
      ])
      return
    }
    downloadCsv(`${fileBase}.csv`, [
      ['year', primary.name],
      ...primary.points.map((point) => [point.year, point.value]),
    ])
  }

  async function exportPng() {
    try {
      await downloadChartPng(holder.current, `${fileBase}.png`, '#210b11')
    } catch (error) {
      console.warn('Chart export failed:', error)
    }
  }

  return (
    <Card title={title}>
      <ChartControls
        range={range}
        onRange={setRange}
        units={units}
        onUnits={setUnits}
        baseYear={baseYear}
      />
      <div ref={holder}>
        {secondary && secondaryView ? (
          <MultiLineChart
            series={[
              { key: 'primary', name: primary.name, color: SERIES_COLORS[0], data: primaryView },
              { key: 'secondary', name: secondary.name, color: SERIES_COLORS[1], data: secondaryView },
            ]}
            unit={viewUnit}
          />
        ) : (
          <IndicatorLineChart data={primaryView} unit={viewUnit} seriesName={primary.name} />
        )}
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
  const [compareCode, setCompareCode] = useQueryState('compare', '')
  const comparing = compareCode !== '' && compareCode !== countryCode
  const countryLabel = nameOf(countryCode)
  const compareLabel = comparing ? nameOf(compareCode) : ''
  const codes = comparing ? [countryCode, compareCode] : [countryCode]

  const { data, loading, error, reload } = useAsyncData(
    () => loadProfile(codes),
    [codes.join('|')],
  )

  const hasData =
    data !== null &&
    Object.values(data).some((byCountry) => latestOf(byCountry[countryCode]) !== null)

  const insights = data
    ? buildInsights(data.inflation?.[countryCode] ?? [], t, {
        format: (value) => `${value.toFixed(1)}%`,
      })
    : []

  return (
    <PageLayout title={t('nav.country')} subtitle={t('country.subtitle')}>
      <div className={styles.controls}>
        <CountrySelect label={t('common.country')} value={countryCode} onChange={setCountryCode} />
        <CountrySelect
          label={t('country.compare')}
          value={comparing ? compareCode : ''}
          onChange={setCompareCode}
          emptyLabel={t('country.compareNone')}
        />
        <PinButton code={countryCode} />
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
              const latest = latestOf(data[card.key]?.[countryCode])
              const other = comparing ? latestOf(data[card.key]?.[compareCode]) : null
              const delta =
                latest && other ? (latest.value as number) - (other.value as number) : null
              return (
                <div key={card.key} className={styles.stat}>
                  <span className={styles.statLabel}>
                    {t(card.label)}
                    <Tooltip text={t(card.desc)} label={t(card.label)} />
                  </span>
                  <span className={styles.statValue}>
                    {latest === null
                      ? t('common.noData')
                      : formatStat(card.unit, latest.value as number)}
                  </span>
                  {comparing ? (
                    <span className={styles.compareRow}>
                      <span className={styles.compareName}>{compareLabel}</span>
                      <span className={styles.compareValue}>
                        {other === null
                          ? t('common.noData')
                          : formatStat(card.unit, other.value as number)}
                      </span>
                      {delta === null ? null : (
                        <span className={delta >= 0 ? styles.deltaUp : styles.deltaDown}>
                          {formatDelta(card.unit, delta)}
                        </span>
                      )}
                    </span>
                  ) : latest === null ? null : (
                    <span className={styles.statHint}>
                      {t('common.latest', { year: latest.year })}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {insights.length > 0 ? (
            <InsightList title={t('common.insights')} items={insights} />
          ) : null}

          {CHARTS.map((chart) => (
            <ChartCard
              key={chart.key}
              title={
                comparing
                  ? `${t(chart.title, { country: countryLabel })} · ${compareLabel}`
                  : t(chart.title, { country: countryLabel })
              }
              primary={{ name: countryLabel, points: data[chart.key]?.[countryCode] ?? [] }}
              secondary={
                comparing
                  ? { name: compareLabel, points: data[chart.key]?.[compareCode] ?? [] }
                  : null
              }
              unit={chart.unit}
              fileBase={`macroscope-${countryCode}${comparing ? '-vs-' + compareCode : ''}-${chart.file}`}
            />
          ))}
        </>
      )}
    </PageLayout>
  )
}
