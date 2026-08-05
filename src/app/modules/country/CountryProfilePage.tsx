import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
  Select,
  StatCard,
} from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { usePersistentState } from '../../../shared/hooks/usePersistentState'
import { getIndicator } from '../../../backend/indicators'
import { COUNTRIES, INDICATORS, countryName } from '../../../backend/constants'
import type { IndicatorPoint } from '../../../backend/worldbank'
import IndicatorLineChart from '../../../shared/charts/IndicatorLineChart'
import styles from './CountryProfilePage.module.css'

const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name))

type Unit = 'usd' | 'percent' | 'years'

const CARDS: { key: string; code: string; label: string; unit: Unit }[] = [
  { key: 'gdpPerCapita', code: INDICATORS.gdpPerCapita, label: 'GDP per capita', unit: 'usd' },
  { key: 'gdpGrowth', code: INDICATORS.gdpGrowth, label: 'GDP growth', unit: 'percent' },
  { key: 'inflation', code: INDICATORS.inflation, label: 'Inflation', unit: 'percent' },
  { key: 'unemployment', code: INDICATORS.unemployment, label: 'Unemployment', unit: 'percent' },
  { key: 'lifeExpectancy', code: INDICATORS.lifeExpectancy, label: 'Life expectancy', unit: 'years' },
  { key: 'tradePercentGdp', code: INDICATORS.tradePercentGdp, label: 'Trade share of GDP', unit: 'percent' },
]

function latestOf(points: IndicatorPoint[] | undefined): IndicatorPoint | null {
  const facts = (points ?? []).filter((point) => point.value !== null)
  return facts.length > 0 ? facts[facts.length - 1] : null
}

function formatStat(unit: Unit, value: number): string {
  if (unit === 'usd') return `$${Math.round(value).toLocaleString('en-US')}`
  if (unit === 'years') return `${value.toFixed(1)} years`
  return `${value.toFixed(1)}%`
}

async function loadProfile(countryCode: string): Promise<Record<string, IndicatorPoint[]>> {
  const series = await Promise.all(CARDS.map((card) => getIndicator(countryCode, card.code)))
  return Object.fromEntries(CARDS.map((card, index) => [card.key, series[index]]))
}

export default function CountryProfilePage() {
  const [countryCode, setCountryCode] = usePersistentState('macroscope.country.selected', 'KAZ')

  const { data, loading, error, reload } = useAsyncData(
    () => loadProfile(countryCode),
    [countryCode],
  )

  const hasData =
    data !== null && Object.values(data).some((series) => latestOf(series) !== null)

  return (
    <PageLayout
      title="Country Profile"
      subtitle="All the key indicators for one country in a single view"
    >
      <div className={styles.controls}>
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

      {loading ? (
        <LoadingState label={`Loading the profile for ${countryName(countryCode)}`} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !hasData || data === null ? (
        <EmptyState message={`No indicator data available for ${countryName(countryCode)}`} />
      ) : (
        <>
          <div className={styles.stats}>
            {CARDS.map((card) => {
              const latest = latestOf(data[card.key])
              return (
                <StatCard
                  key={card.key}
                  label={card.label}
                  value={latest === null ? 'No data' : formatStat(card.unit, latest.value as number)}
                  hint={latest === null ? undefined : `Latest, ${latest.year}`}
                />
              )
            })}
          </div>

          <Card title={`GDP per capita, ${countryName(countryCode)}`}>
            <IndicatorLineChart
              data={data.gdpPerCapita}
              seriesName="GDP per capita"
              unit=""
            />
          </Card>

          <Card title={`Inflation, ${countryName(countryCode)}`}>
            <IndicatorLineChart data={data.inflation} seriesName="Inflation" unit="%" />
          </Card>

          <Card title={`Unemployment, ${countryName(countryCode)}`}>
            <IndicatorLineChart data={data.unemployment} seriesName="Unemployment" unit="%" />
          </Card>
        </>
      )}
    </PageLayout>
  )
}
