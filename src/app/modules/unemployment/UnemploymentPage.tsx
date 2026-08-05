import { usePersistentState } from '../../../shared/hooks/usePersistentState'
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
  StatCard,
} from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { getIndicatorForCountries } from '../../../backend/indicators'
import { COUNTRIES, INDICATORS, countryName } from '../../../backend/constants'
import type { IndicatorPoint } from '../../../backend/worldbank'
import MultiLineChart from '../../../shared/charts/MultiLineChart'
import { SERIES_COLORS } from '../../../shared/charts/chartStyle'
import styles from './UnemploymentPage.module.css'

const SORTED_COUNTRIES = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name))
const DEFAULT_SELECTED = ['KAZ', 'USA', 'DEU']
const MAX_COUNTRIES = 5

function factsOf(points: IndicatorPoint[] | undefined) {
  return (points ?? []).filter((point) => point.value !== null)
}

export default function UnemploymentPage() {
  const [selected, setSelected] = usePersistentState<string[]>(
    'macroscope.unemployment.countries',
    DEFAULT_SELECTED,
  )

  const { data, loading, error, reload } = useAsyncData(
    () => getIndicatorForCountries(selected, INDICATORS.unemployment),
    [selected.join('|')],
  )

  function toggleCountry(code: string) {
    setSelected((current) => {
      if (current.includes(code)) {
        return current.length > 1 ? current.filter((item) => item !== code) : current
      }
      if (current.length >= MAX_COUNTRIES) return current
      return [...current, code]
    })
  }

  const series = selected.map((code, index) => ({
    key: code,
    name: countryName(code),
    color: SERIES_COLORS[index % SERIES_COLORS.length],
    data: data?.[code] ?? [],
  }))
  const hasData = data !== null && series.some((item) => factsOf(item.data).length > 0)

  return (
    <PageLayout
      title="Unemployment Analysis"
      subtitle="Unemployment dynamics with several countries on one chart"
    >
      <Card title={`Countries, up to ${MAX_COUNTRIES}`}>
        <div className={styles.chips}>
          {SORTED_COUNTRIES.map((country) => {
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
          })}
        </div>
      </Card>

      {loading ? (
        <LoadingState label="Loading unemployment data" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !hasData ? (
        <EmptyState message="No unemployment data available for the selected countries" />
      ) : (
        <>
          <Card title="Unemployment rate, share of labor force">
            <MultiLineChart series={series} unit="%" />
          </Card>

          <div className={styles.stats}>
            {series.map((item) => {
              const facts = factsOf(item.data)
              if (facts.length === 0) {
                return (
                  <StatCard
                    key={item.key}
                    label={item.name}
                    value="No data"
                  />
                )
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
                    delta === null
                      ? undefined
                      : `${delta >= 0 ? '+' : ''}${delta.toFixed(1)} points since ${base?.year}`
                  }
                />
              )
            })}
          </div>
        </>
      )}
    </PageLayout>
  )
}
