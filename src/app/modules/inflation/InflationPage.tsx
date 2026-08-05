import { useMemo } from 'react'
import { usePersistentState } from '../../../shared/hooks/usePersistentState'
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
  Select,
  StatCard,
} from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { getIndicator } from '../../../backend/indicators'
import { COUNTRIES, INDICATORS, countryName } from '../../../backend/constants'
import { buildForecastSeries, FORECAST_HORIZON } from './forecast'
import type { ForecastModel } from './forecast'
import ForecastChart from './ForecastChart'
import styles from './InflationPage.module.css'

const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name))

const MODELS: { key: ForecastModel; label: string }[] = [
  { key: 'linear', label: 'Linear trend' },
  { key: 'movingAverage', label: 'Moving average' },
]

export default function InflationPage() {
  const [countryCode, setCountryCode] = usePersistentState('macroscope.inflation.country', 'KAZ')
  const [model, setModel] = usePersistentState<ForecastModel>('macroscope.inflation.model', 'linear')

  const { data, loading, error, reload } = useAsyncData(
    () => getIndicator(countryCode, INDICATORS.inflation),
    [countryCode],
  )

  const series = useMemo(
    () => (data ? buildForecastSeries(data, model) : []),
    [data, model],
  )

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

  return (
    <PageLayout
      title="Inflation Forecast"
      subtitle="Consumer price inflation with a simple projection"
    >
      <div className={styles.controls}>
        <div className={styles.selectWrap}>
          <Select
            label="Country"
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
          >
            {SORTED_COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </Select>
        </div>
        <div className={styles.models}>
          <span className={styles.modelsLabel}>Forecast model</span>
          <div className={styles.modelButtons}>
            {MODELS.map((item) => (
              <Button
                key={item.key}
                variant={model === item.key ? 'accent' : 'secondary'}
                onClick={() => setModel(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState label={`Loading inflation data for ${countryName(countryCode)}`} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !latest ? (
        <EmptyState message={`No inflation data available for ${countryName(countryCode)}`} />
      ) : (
        <>
          <div className={styles.stats}>
            <StatCard
              label={`Latest actual, ${latest.year}`}
              value={`${(latest.value as number).toFixed(1)}%`}
            />
            <StatCard
              label="Average over the last 10 years"
              value={averageTen === null ? 'No data' : `${averageTen.toFixed(1)}%`}
            />
            <StatCard
              label={`Forecast for ${latest.year + 1}`}
              value={nextForecast === null ? 'No data' : `${nextForecast.toFixed(1)}%`}
              hint={model === 'linear' ? 'Linear trend model' : 'Moving average model'}
            />
          </div>

          <Card title={`Inflation, ${countryName(countryCode)}: actual and forecast`}>
            <ForecastChart data={series} boundaryYear={latest.year} />
            <p className={styles.note}>
              Solid line shows actual data. Dashed line shows a simple {FORECAST_HORIZON} year
              projection. This is a statistical illustration, not financial advice.
            </p>
          </Card>
        </>
      )}
    </PageLayout>
  )
}
