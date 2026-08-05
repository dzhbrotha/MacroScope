import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { usePersistentState } from '../../../shared/hooks/usePersistentState'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
} from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { getIndicator } from '../../../backend/indicators'
import { INDICATORS, countryName } from '../../../backend/constants'
import type { IndicatorPoint } from '../../../backend/worldbank'
import IndicatorLineChart from '../../../shared/charts/IndicatorLineChart'
import { SANCTIONED_COUNTRIES, SANCTION_EVENTS } from './data'
import styles from './SanctionsPage.module.css'

const CHART_CONFIG = [
  { title: 'GDP growth', unit: '%', indicator: INDICATORS.gdpGrowth },
  { title: 'Trade share of GDP', unit: '%', indicator: INDICATORS.tradePercentGdp },
  { title: 'FDI inflows share of GDP', unit: '%', indicator: INDICATORS.fdiInflows },
]

const COMPARE_SPAN = 3

function windowAverage(points: IndicatorPoint[], fromYear: number, toYear: number): number | null {
  const values = points
    .filter((point) => point.year >= fromYear && point.year <= toYear && point.value !== null)
    .map((point) => point.value as number)
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function formatValue(value: number | null, unit: string): string {
  return value === null ? 'No data' : `${value.toFixed(1)}${unit}`
}

export default function SanctionsPage() {
  const [country, setCountry] = usePersistentState('macroscope.sanctions.country', 'RUS')
  const [selectedYear, setSelectedYear] = useState(() => SANCTION_EVENTS[country][0].year)
  const events = SANCTION_EVENTS[country]

  const { data, loading, error, reload } = useAsyncData(
    () =>
      Promise.all(
        CHART_CONFIG.map((config) => getIndicator(country, config.indicator)),
      ),
    [country],
  )

  function selectCountry(code: string) {
    setCountry(code)
    setSelectedYear(SANCTION_EVENTS[code][0].year)
  }

  const hasData =
    data !== null && data.some((series) => series.some((point) => point.value !== null))

  return (
    <PageLayout
      title="Sanctions Impact"
      subtitle="GDP, trade and investment before and after sanctions"
    >
      <div className={styles.countries}>
        {SANCTIONED_COUNTRIES.map((code) => (
          <Button
            key={code}
            variant={code === country ? 'accent' : 'secondary'}
            onClick={() => selectCountry(code)}
          >
            {countryName(code)}
          </Button>
        ))}
      </div>

      <Card title="Sanction timeline">
        <div className={styles.timeline}>
          {events.map((event) => (
            <button
              key={event.year}
              className={
                event.year === selectedYear
                  ? `${styles.event} ${styles.eventSelected}`
                  : styles.event
              }
              onClick={() => setSelectedYear(event.year)}
            >
              <span className={styles.eventYear}>{event.year}</span>
              <span className={styles.eventBody}>
                <span className={styles.eventTitle}>{event.title}</span>
                <span className={styles.eventText}>{event.description}</span>
              </span>
            </button>
          ))}
        </div>
        <p className={styles.hint}>
          Select an event to compare the three years before it with the three years after it.
        </p>
      </Card>

      {loading ? (
        <LoadingState label={`Loading data for ${countryName(country)}`} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !hasData ? (
        <EmptyState message={`No indicator data available for ${countryName(country)}`} />
      ) : data ? (
        <>
          <div className={styles.stats}>
            {CHART_CONFIG.map((config, index) => {
              const points = data[index]
              const before = windowAverage(points, selectedYear - COMPARE_SPAN, selectedYear - 1)
              const after = windowAverage(points, selectedYear, selectedYear + COMPARE_SPAN - 1)
              const delta = before !== null && after !== null ? after - before : null
              return (
                <Card key={config.title} title={config.title}>
                  <div className={styles.statRow}>
                    <div className={styles.statCol}>
                      <span className={styles.statLabel}>3y before {selectedYear}</span>
                      <span className={styles.statValue}>{formatValue(before, config.unit)}</span>
                    </div>
                    <div className={styles.statCol}>
                      <span className={styles.statLabel}>3y after</span>
                      <span className={styles.statValue}>{formatValue(after, config.unit)}</span>
                    </div>
                  </div>
                  {delta !== null ? (
                    <span className={styles.delta}>
                      {delta >= 0 ? (
                        <ArrowUpRight size={14} strokeWidth={1.75} />
                      ) : (
                        <ArrowDownRight size={14} strokeWidth={1.75} />
                      )}
                      {delta >= 0 ? '+' : ''}
                      {delta.toFixed(1)} points
                    </span>
                  ) : null}
                </Card>
              )
            })}
          </div>

          {CHART_CONFIG.map((config, index) => (
            <Card key={config.title} title={`${config.title}, ${countryName(country)}`}>
              <IndicatorLineChart
                data={data[index]}
                unit={config.unit}
                seriesName={config.title}
                markers={events.map((event) => ({
                  year: event.year,
                  label: String(event.year),
                }))}
              />
            </Card>
          ))}
        </>
      ) : null}
    </PageLayout>
  )
}
