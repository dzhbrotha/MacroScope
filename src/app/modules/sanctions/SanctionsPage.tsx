import { useRef } from 'react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  ExportBar,
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
import { useI18n } from '../../../shared/i18n'
import type { TranslationKey } from '../../../shared/i18n'
import BeforeAfterChart from './BeforeAfterChart'
import { SANCTIONED_COUNTRIES, SANCTION_EVENTS } from './data'
import styles from './SanctionsPage.module.css'

const CHART_CONFIG: { title: TranslationKey; desc: TranslationKey; unit: string; indicator: string }[] = [
  { title: 'sanctions.gdpGrowth', desc: 'ind.gdpGrowth.desc', unit: '%', indicator: INDICATORS.gdpGrowth },
  { title: 'sanctions.trade', desc: 'ind.trade.desc', unit: '%', indicator: INDICATORS.tradePercentGdp },
  { title: 'sanctions.fdi', desc: 'ind.fdi.desc', unit: '%', indicator: INDICATORS.fdiInflows },
]

const COMPARE_SPAN = 3

function windowAverage(points: IndicatorPoint[], fromYear: number, toYear: number): number | null {
  const values = points
    .filter((point) => point.year >= fromYear && point.year <= toYear && point.value !== null)
    .map((point) => point.value as number)
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export default function SanctionsPage() {
  const { t, lang } = useI18n()
  const { nameOf } = useCountries()
  const [country, setCountry] = useQueryState('country', 'RUS')
  const events = SANCTION_EVENTS[country] ?? SANCTION_EVENTS.RUS
  const [yearRaw, setYearRaw] = useQueryState('event', String(events[0].year))
  const selectedYear = events.some((event) => String(event.year) === yearRaw)
    ? Number(yearRaw)
    : events[0].year
  const countryLabel = nameOf(country)
  const holders = useRef<(HTMLDivElement | null)[]>([])

  const { data, loading, error, reload } = useAsyncData(
    () => Promise.all(CHART_CONFIG.map((config) => getIndicator(country, config.indicator))),
    [country],
  )

  function selectCountry(code: string) {
    setCountry(code)
    setYearRaw(String(SANCTION_EVENTS[code][0].year))
  }

  const hasData =
    data !== null && data.some((series) => series.some((point) => point.value !== null))

  function exportCsv(index: number) {
    if (!data) return
    downloadCsv(`macroscope-${country}-${CHART_CONFIG[index].indicator}.csv`, [
      ['year', t(CHART_CONFIG[index].title)],
      ...data[index].map((point) => [point.year, point.value]),
    ])
  }

  async function exportPng(index: number) {
    try {
      await downloadChartPng(
        holders.current[index],
        `macroscope-${country}-${CHART_CONFIG[index].indicator}.png`,
        '#0b213e',
      )
    } catch (exportError) {
      console.warn('Chart export failed:', exportError)
    }
  }

  return (
    <PageLayout title={t('nav.sanctions')} subtitle={t('sanctions.subtitle')}>
      <div className={styles.countries}>
        {SANCTIONED_COUNTRIES.map((code) => (
          <Button
            key={code}
            variant={code === country ? 'accent' : 'secondary'}
            onClick={() => selectCountry(code)}
          >
            {nameOf(code)}
          </Button>
        ))}
      </div>

      <Card title={t('sanctions.timeline')}>
        <div className={styles.timeline}>
          {events.map((event) => (
            <button
              key={event.year}
              className={
                event.year === selectedYear
                  ? `${styles.event} ${styles.eventSelected}`
                  : styles.event
              }
              onClick={() => setYearRaw(String(event.year))}
            >
              <span className={styles.eventYear}>{event.year}</span>
              <span className={styles.eventBody}>
                <span className={styles.eventTitle}>{event.title[lang]}</span>
                <span className={styles.eventText}>{event.description[lang]}</span>
              </span>
            </button>
          ))}
        </div>
        <p className={styles.hint}>{t('sanctions.hint')}</p>
      </Card>

      {loading ? (
        <LoadingState label={t('sanctions.loading', { country: countryLabel })} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !hasData ? (
        <EmptyState message={t('sanctions.empty', { country: countryLabel })} />
      ) : data ? (
        <>
          {(() => {
            const paired = CHART_CONFIG.map((config, index) => ({
              name: t(config.title),
              before: windowAverage(data[index], selectedYear - COMPARE_SPAN, selectedYear - 1),
              after: windowAverage(data[index], selectedYear, selectedYear + COMPARE_SPAN - 1),
            }))
            return paired.some((row) => row.before !== null || row.after !== null) ? (
              <Card title={t('sanctions.chart')}>
                <BeforeAfterChart
                  rows={paired}
                  beforeLabel={t('sanctions.before', { year: selectedYear })}
                  afterLabel={t('sanctions.after')}
                />
              </Card>
            ) : null
          })()}

          <div className={styles.stats}>
            {CHART_CONFIG.map((config, index) => {
              const points = data[index]
              const before = windowAverage(points, selectedYear - COMPARE_SPAN, selectedYear - 1)
              const after = windowAverage(points, selectedYear, selectedYear + COMPARE_SPAN - 1)
              const delta = before !== null && after !== null ? after - before : null
              const format = (value: number | null) =>
                value === null ? t('common.noData') : `${value.toFixed(1)}${config.unit}`
              return (
                <Card key={config.title} title={t(config.title)}>
                  <div className={styles.statRow}>
                    <div className={styles.statCol}>
                      <span className={styles.statLabel}>
                        {t('sanctions.before', { year: selectedYear })}
                      </span>
                      <span className={styles.statValue}>{format(before)}</span>
                    </div>
                    <div className={styles.statCol}>
                      <span className={styles.statLabel}>{t('sanctions.after')}</span>
                      <span className={styles.statValue}>{format(after)}</span>
                    </div>
                  </div>
                  {delta !== null ? (
                    <span className={styles.delta}>
                      {delta >= 0 ? (
                        <ArrowUpRight size={14} strokeWidth={1.75} />
                      ) : (
                        <ArrowDownRight size={14} strokeWidth={1.75} />
                      )}
                      {t('sanctions.points', {
                        value: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}`,
                      })}
                    </span>
                  ) : null}
                </Card>
              )
            })}
          </div>

          {CHART_CONFIG.map((config, index) => (
            <Card key={config.title} title={`${t(config.title)}, ${countryLabel}`}>
              <div
                ref={(node) => {
                  holders.current[index] = node
                }}
              >
                <IndicatorLineChart
                  data={data[index]}
                  unit={config.unit}
                  seriesName={t(config.title)}
                  markers={events.map((event) => ({
                    year: event.year,
                    label: String(event.year),
                  }))}
                />
              </div>
              <div className={styles.exportRow}>
                <span className={styles.chartHint}>
                  {t('common.whatIsThis')}
                  <Tooltip text={t(config.desc)} label={t(config.title)} />
                </span>
                <ExportBar onCsv={() => exportCsv(index)} onPng={() => exportPng(index)} />
              </div>
            </Card>
          ))}
        </>
      ) : null}
    </PageLayout>
  )
}
