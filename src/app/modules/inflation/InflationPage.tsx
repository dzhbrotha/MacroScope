import { useMemo, useRef } from 'react'
import {
  Button,
  Card,
  CountrySelect,
  EmptyState,
  ErrorState,
  ExportBar,
  InsightList,
  LoadingState,
  PageLayout,
  StatCard,
  Tooltip,
} from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { useQueryState } from '../../../shared/hooks/useQueryState'
import { getIndicator } from '../../../backend/indicators'
import { INDICATORS } from '../../../backend/constants'
import { useCountries } from '../../../backend/CountriesProvider'
import { buildForecastSeries, FORECAST_HORIZON } from './forecast'
import {
  computeHiddenTax,
  HOURS_PER_MONTH,
  WORKING_DAYS_PER_MONTH,
  yearsWithData,
} from './hiddenTax'
import type { ForecastModel } from './forecast'
import ForecastChart from './ForecastChart'
import ChartControls from '../../../shared/charts/ChartControls'
import { PinButton } from '../../../shared/watchlist'
import { isRange, startYearOf } from '../../../shared/charts/transform'
import { downloadChartPng, downloadCsv } from '../../../shared/lib/exportData'
import { buildInsights } from '../../../shared/lib/insights'
import { useI18n } from '../../../shared/i18n'
import type { TranslationKey } from '../../../shared/i18n'
import styles from './InflationPage.module.css'

const MODELS: { key: ForecastModel; label: TranslationKey }[] = [
  { key: 'linear', label: 'inflation.linear' },
  { key: 'movingAverage', label: 'inflation.movingAverage' },
]

export default function InflationPage() {
  const { t } = useI18n()
  const { nameOf } = useCountries()
  const [countryCode, setCountryCode] = useQueryState('country', 'KAZ')
  const [modelRaw, setModelRaw] = useQueryState('model', 'linear')
  const model: ForecastModel = modelRaw === 'movingAverage' ? 'movingAverage' : 'linear'
  const [rangeRaw, setRange] = useQueryState('range', 'all')
  const range = isRange(rangeRaw) ? rangeRaw : 'all'
  const countryLabel = nameOf(countryCode)
  const chartHolder = useRef<HTMLDivElement>(null)
  const [baseRaw, setBaseYear] = useQueryState('base', '')

  const { data, loading, error, reload } = useAsyncData(
    () => getIndicator(countryCode, INDICATORS.inflation),
    [countryCode],
  )

  // The forecast is always kept: the range only trims the history in front of it.
  const series = useMemo(() => {
    if (!data) return []
    const full = buildForecastSeries(data, model)
    const startYear = startYearOf([data], range)
    return startYear === null ? full : full.filter((point) => point.year >= startYear)
  }, [data, model, range])

  const facts = useMemo(
    () => (data ?? []).filter((point) => point.value !== null),
    [data],
  )
  const latest = facts.length > 0 ? facts[facts.length - 1] : null
  const lastTen = facts.slice(-10)
  const averageTen =
    lastTen.length > 0
      ? lastTen.reduce((sum, point) => sum + (point.value as number), 0) / lastTen.length
      : null
  const nextForecast = latest
    ? series.find((point) => point.year === latest.year + 1)?.forecast ?? null
    : null

  // Inflation restated as hours of work. The default window is five years,
  // which is long enough to be felt and short enough to be remembered.
  const baseYears = useMemo(() => {
    if (!data) return []
    const years = yearsWithData(data)
    return years.slice(0, -1).reverse()
  }, [data])

  const baseYear = useMemo(() => {
    const asked = Number(baseRaw)
    if (baseYears.includes(asked)) return asked
    if (baseYears.length === 0) return null
    const preferred = baseYears[0] - 4
    return baseYears.includes(preferred) ? preferred : baseYears[0]
  }, [baseRaw, baseYears])

  const tax = useMemo(
    () => (data && baseYear !== null ? computeHiddenTax(data, baseYear) : null),
    [data, baseYear],
  )

  const insights = useMemo(
    () =>
      data
        ? buildInsights(data, t, {
            format: (value) => `${value.toFixed(1)}%`,
            forecastNext: nextForecast,
          })
        : [],
    [data, t, nextForecast],
  )

  function exportCsv() {
    downloadCsv(`macroscope-${countryCode}-inflation.csv`, [
      ['year', t('inflation.actual'), t('inflation.forecast')],
      ...series.map((point) => [point.year, point.value, point.forecast]),
    ])
  }

  async function exportPng() {
    try {
      await downloadChartPng(
        chartHolder.current,
        `macroscope-${countryCode}-inflation.png`,
        '#29292a',
      )
    } catch (exportError) {
      console.warn('Chart export failed:', exportError)
    }
  }

  return (
    <PageLayout title={t('nav.inflation')} subtitle={t('inflation.subtitle')}>
      <div className={styles.controls}>
        <div className={styles.selectWrap}>
          <CountrySelect
            label={t('common.country')}
            value={countryCode}
            onChange={setCountryCode}
          />
        </div>
        <PinButton code={countryCode} />
        <div className={styles.models}>
          <span className={styles.modelsLabel}>{t('inflation.model')}</span>
          <div className={styles.modelButtons}>
            {MODELS.map((item) => (
              <Button
                key={item.key}
                variant={model === item.key ? 'accent' : 'secondary'}
                onClick={() => setModelRaw(item.key)}
              >
                {t(item.label)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState label={t('inflation.loading', { country: countryLabel })} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !latest ? (
        <EmptyState message={t('inflation.empty', { country: countryLabel })} />
      ) : (
        <>
          {tax ? (
            <section className={styles.tax}>
              <header className={styles.taxHead}>
                <span className={styles.taxKicker}>{t('tax.title')}</span>
                <label className={styles.taxPick}>
                  <span>{t('tax.base')}</span>
                  <select
                    value={String(baseYear)}
                    onChange={(event) => setBaseYear(event.target.value)}
                  >
                    {baseYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </header>

              <strong className={styles.taxValue}>
                {t(tax.extraHours >= 0 ? 'tax.hours' : 'tax.hoursBack', {
                  hours: Math.abs(tax.extraHours).toFixed(0),
                })}
              </strong>

              <p className={styles.taxBody}>
                {tax.extraHours >= 0
                  ? t('tax.body', {
                      latest: tax.latestYear,
                      base: tax.baseYear,
                      days: Math.abs(tax.extraDays).toFixed(1),
                      month: WORKING_DAYS_PER_MONTH.toFixed(1),
                    })
                  : t('tax.bodyBack', { latest: tax.latestYear, base: tax.baseYear })}
              </p>

              <p className={styles.taxPrice}>
                {t(tax.priceRise >= 0 ? 'tax.price' : 'tax.cheaper', {
                  percent: Math.abs(tax.priceRise).toFixed(1),
                })}
              </p>

              <p className={styles.taxMethod}>
                {t('tax.method', {
                  base: tax.baseYear,
                  latest: tax.latestYear,
                  hours: HOURS_PER_MONTH,
                })}
                {tax.gaps.length > 0 ? ' ' + t('tax.gaps', { years: tax.gaps.join(', ') }) : ''}
              </p>
            </section>
          ) : null}

          <div className={styles.stats}>
            <StatCard
              label={t('inflation.latest', { year: latest.year })}
              value={`${(latest.value as number).toFixed(1)}%`}
            />
            <StatCard
              label={t('inflation.average10')}
              value={averageTen === null ? t('common.noData') : `${averageTen.toFixed(1)}%`}
            />
            <StatCard
              label={t('inflation.forecastFor', { year: latest.year + 1 })}
              value={nextForecast === null ? t('common.noData') : `${nextForecast.toFixed(1)}%`}
              hint={t(model === 'linear' ? 'inflation.linear' : 'inflation.movingAverage')}
            />
          </div>

          {insights.length > 0 ? (
            <InsightList title={t('common.insights')} items={insights} />
          ) : null}

          <Card title={t('inflation.chart', { country: countryLabel })}>
            <ChartControls range={range} onRange={setRange} />
            <div ref={chartHolder}>
              <ForecastChart
                data={series}
                boundaryYear={latest.year}
                actualLabel={t('inflation.actual')}
                forecastLabel={t('inflation.forecast')}
              />
            </div>
            <p className={styles.note}>
              {t('inflation.note', { years: FORECAST_HORIZON })}
              <Tooltip text={t('ind.inflation.desc')} label={t('ind.inflation')} />
            </p>
            <div className={styles.exportRow}>
              <ExportBar onCsv={exportCsv} onPng={exportPng} />
            </div>
          </Card>
        </>
      )}
    </PageLayout>
  )
}
