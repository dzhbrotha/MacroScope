import { useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import {
  Card,
  EmptyState,
  ErrorState,
  ExportBar,
  LoadingState,
  PageLayout,
  StatCard,
  Tooltip,
} from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { useQueryState, useQueryStateList } from '../../../shared/hooks/useQueryState'
import { getIndicatorForCountries } from '../../../backend/indicators'
import { INDICATORS } from '../../../backend/constants'
import { useCountries } from '../../../backend/CountriesProvider'
import type { IndicatorPoint } from '../../../backend/worldbank'
import MultiLineChart from '../../../shared/charts/MultiLineChart'
import { SERIES_COLORS } from '../../../shared/charts/chartStyle'
import ChartControls from '../../../shared/charts/ChartControls'
import { applyView, isRange, isUnits, startYearOf, unitFor } from '../../../shared/charts/transform'
import { downloadChartPng, downloadCsv } from '../../../shared/lib/exportData'
import { useI18n } from '../../../shared/i18n'
import styles from './UnemploymentPage.module.css'

const DEFAULT_SELECTED = ['KAZ', 'USA', 'DEU']
const MAX_COUNTRIES = 5

function factsOf(points: IndicatorPoint[] | undefined) {
  return (points ?? []).filter((point) => point.value !== null)
}

export default function UnemploymentPage() {
  const { t } = useI18n()
  const { countries, featured, nameOf, matches } = useCountries()
  const [selected, setSelected] = useQueryStateList('countries', DEFAULT_SELECTED)
  const [query, setQuery] = useState('')
  const [rangeRaw, setRange] = useQueryState('range', 'all')
  const [unitsRaw, setUnits] = useQueryState('units', 'level')
  const range = isRange(rangeRaw) ? rangeRaw : 'all'
  const units = isUnits(unitsRaw) ? unitsRaw : 'level'
  const chartHolder = useRef<HTMLDivElement>(null)

  const { data, loading, error, reload } = useAsyncData(
    () => getIndicatorForCountries(selected, INDICATORS.unemployment),
    [selected.join('|')],
  )

  // Two hundred chips would be unusable, so the grid shows the curated set plus
  // whatever is selected, and opens up to the whole world once you search.
  const visible = useMemo(() => {
    if (query.trim()) {
      return countries.filter((country) => matches(country, query)).slice(0, 60)
    }
    const base = new Map(featured.map((country) => [country.code, country]))
    selected.forEach((code) => {
      if (!base.has(code)) base.set(code, { code, name: nameOf(code), alt: '' })
    })
    return [...base.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [countries, featured, query, selected, nameOf, matches])

  function toggleCountry(code: string) {
    if (selected.includes(code)) {
      if (selected.length > 1) setSelected(selected.filter((item) => item !== code))
      return
    }
    if (selected.length >= MAX_COUNTRIES) return
    setSelected([...selected, code])
  }

  const raw = selected.map((code, index) => ({
    key: code,
    name: nameOf(code),
    color: SERIES_COLORS[index % SERIES_COLORS.length],
    data: data?.[code] ?? [],
  }))

  // Every line is clipped and converted the same way, so the shapes stay
  // comparable no matter which country was picked first.
  const startYear = startYearOf(raw.map((item) => item.data), range)
  const series = raw.map((item) => ({ ...item, data: applyView(item.data, startYear, units) }))
  const hasData = data !== null && series.some((item) => factsOf(item.data).length > 0)
  const baseYear = factsOf(series[0]?.data)[0]?.year ?? null

  function exportCsv() {
    const years = new Set<number>()
    series.forEach((item) => item.data.forEach((point) => years.add(point.year)))
    const sorted = [...years].sort((a, b) => a - b)
    downloadCsv('macroscope-unemployment.csv', [
      ['year', ...series.map((item) => item.name)],
      ...sorted.map((year) => [
        year,
        ...series.map((item) => item.data.find((point) => point.year === year)?.value ?? null),
      ]),
    ])
  }

  async function exportPng() {
    try {
      await downloadChartPng(chartHolder.current, 'macroscope-unemployment.png', '#210b11')
    } catch (exportError) {
      console.warn('Chart export failed:', exportError)
    }
  }

  return (
    <PageLayout title={t('nav.unemployment')} subtitle={t('unemp.subtitle')}>
      <Card title={t('unemp.pick', { max: MAX_COUNTRIES })}>
        <div className={styles.searchRow}>
          <Search size={15} strokeWidth={2} className={styles.searchIcon} />
          <input
            className={styles.search}
            value={query}
            placeholder={t('common.search')}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className={styles.chips}>
          {visible.length === 0 ? (
            <p className={styles.searchEmpty}>{t('common.searchEmpty')}</p>
          ) : (
            visible.map((country) => {
              const isSelected = selected.includes(country.code)
              const isDisabled = !isSelected && selected.length >= MAX_COUNTRIES
              return (
                <button
                  key={country.code}
                  className={isSelected ? `${styles.chip} ${styles.chipSelected}` : styles.chip}
                  onClick={() => toggleCountry(country.code)}
                  disabled={isDisabled}
                >
                  {country.name}
                </button>
              )
            })
          )}
        </div>
      </Card>

      {loading ? (
        <LoadingState label={t('unemp.loading')} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !hasData ? (
        <EmptyState message={t('unemp.empty')} />
      ) : (
        <>
          <Card title={t('unemp.chart')}>
            <ChartControls
              range={range}
              onRange={setRange}
              units={units}
              onUnits={setUnits}
              baseYear={baseYear}
            />
            <div ref={chartHolder}>
              <MultiLineChart series={series} unit={unitFor(units, '%')} />
            </div>
            <div className={styles.exportRow}>
              <ExportBar onCsv={exportCsv} onPng={exportPng} />
            </div>
          </Card>

          {/* The cards always report the real rate, even when the chart is
              showing an index, so the headline number never lies. */}
          <div className={styles.stats}>
            {raw.map((item) => {
              const facts = factsOf(item.data)
              if (facts.length === 0) {
                return <StatCard key={item.key} label={item.name} value={t('common.noData')} />
              }
              const latest = facts[facts.length - 1]
              const earlier = facts.filter((point) => point.year <= latest.year - 10)
              const base = earlier.length > 0 ? earlier[earlier.length - 1] : null
              const delta =
                base === null ? null : (latest.value as number) - (base.value as number)
              return (
                <StatCard
                  key={item.key}
                  label={`${item.name}, ${latest.year}`}
                  value={`${(latest.value as number).toFixed(1)}%`}
                  hint={
                    delta === null || base === null
                      ? undefined
                      : t('unemp.since', {
                          delta: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`,
                          year: base.year,
                        })
                  }
                />
              )
            })}
          </div>

          <p className={styles.legend}>
            {t('ind.unemployment')}
            <Tooltip text={t('ind.unemployment.desc')} label={t('ind.unemployment')} />
          </p>
        </>
      )}
    </PageLayout>
  )
}
