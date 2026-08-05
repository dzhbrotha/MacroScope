import { useMemo, useState } from 'react'
import { Globe2 } from 'lucide-react'
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  PageLayout,
  Table,
} from '../../../shared/components'
import type { TableColumn } from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { getIndicatorForCountries } from '../../../backend/indicators'
import { INDICATORS } from '../../../backend/constants'
import { fetchWorldBankCountries, type IndicatorPoint } from '../../../backend/worldbank'
import { computeScores, WEIGHTS } from './index'
import type { CountryMetrics, ScoredCountry } from './index'
import styles from './QualityOfLifePage.module.css'

function latestOf(points: IndicatorPoint[] | undefined): number | null {
  const facts = (points ?? []).filter((point) => point.value !== null)
  return facts.length > 0 ? (facts[facts.length - 1].value as number) : null
}

async function loadMetrics(): Promise<CountryMetrics[]> {
  const countries = await fetchWorldBankCountries()
  const codes = countries.map((country) => country.code)
  const gdp = await getIndicatorForCountries(codes, INDICATORS.gdpPerCapita)
  const life = await getIndicatorForCountries(codes, INDICATORS.lifeExpectancy)
  const inflation = await getIndicatorForCountries(codes, INDICATORS.inflation)
  const unemployment = await getIndicatorForCountries(codes, INDICATORS.unemployment)
  return countries.map((country) => ({
    code: country.code,
    name: country.name,
    gdpPerCapita: latestOf(gdp[country.code]),
    lifeExpectancy: latestOf(life[country.code]),
    inflation: latestOf(inflation[country.code]),
    unemployment: latestOf(unemployment[country.code]),
  }))
}

const BAR_ROWS = [
  { key: 'gdp', label: 'GDP per capita', weight: WEIGHTS.gdp },
  { key: 'life', label: 'Life expectancy', weight: WEIGHTS.life },
  { key: 'inflation', label: 'Price stability', weight: WEIGHTS.inflation },
  { key: 'unemployment', label: 'Employment', weight: WEIGHTS.unemployment },
] as const

export default function QualityOfLifePage() {
  const { data, loading, error, reload } = useAsyncData(loadMetrics, [])
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

  const result = useMemo(() => (data ? computeScores(data) : null), [data])
  const selected: ScoredCountry | null = result
    ? (result.scored.find((row) => row.code === selectedCode) ?? result.scored[0] ?? null)
    : null

  const columns: TableColumn<ScoredCountry>[] = [
    { key: 'rank', header: 'Rank', render: (row) => row.rank },
    {
      key: 'name',
      header: 'Country',
      render: (row) => (
        <button className={styles.countryLink} onClick={() => setSelectedCode(row.code)}>
          {row.name}
        </button>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      align: 'right',
      render: (row) => <span className={styles.score}>{row.score.toFixed(1)}</span>,
    },
    {
      key: 'gdp',
      header: 'GDP per capita',
      align: 'right',
      render: (row) => `$${Math.round(row.gdpPerCapita as number).toLocaleString('en-US')}`,
    },
    {
      key: 'life',
      header: 'Life expectancy',
      align: 'right',
      render: (row) => `${(row.lifeExpectancy as number).toFixed(1)}y`,
    },
    {
      key: 'inflation',
      header: 'Inflation',
      align: 'right',
      render: (row) => `${(row.inflation as number).toFixed(1)}%`,
    },
    {
      key: 'unemployment',
      header: 'Unemployment',
      align: 'right',
      render: (row) => `${(row.unemployment as number).toFixed(1)}%`,
    },
  ]

  return (
    <PageLayout
      title="Quality of Life Index"
      subtitle="A composite index built from open World Bank indicators"
    >
      {loading ? (
        <LoadingState label="Building the index from World Bank data, the first load can take a minute" />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !result || result.scored.length === 0 ? (
        <EmptyState icon={Globe2} message="Not enough country data to build the index" />
      ) : (
        <>
          <Card title={`Ranking, ${result.scored.length} countries`}>
            <Table
              columns={columns}
              rows={result.scored}
              rowKey={(row) => row.code}
            />
            {result.excluded.length > 0 ? (
              <p className={styles.note}>
                Excluded for missing data: {result.excluded.join(', ')}
              </p>
            ) : null}
          </Card>

          {selected ? (
            <Card title={`${selected.name}: rank ${selected.rank} of ${result.scored.length}`}>
              <div className={styles.detailScore}>
                <span className={styles.detailValue}>{selected.score.toFixed(1)}</span>
                <span className={styles.detailLabel}>composite score out of 100</span>
              </div>
              <div className={styles.bars}>
                {BAR_ROWS.map((bar) => (
                  <div key={bar.key} className={styles.barRow}>
                    <span className={styles.barLabel}>
                      {bar.label}
                      <span className={styles.barWeight}>
                        {Math.round(bar.weight * 100)}% weight
                      </span>
                    </span>
                    <div className={styles.track}>
                      <div
                        className={styles.fill}
                        style={{ width: `${selected.subscores[bar.key]}%` }}
                      />
                    </div>
                    <span className={styles.barValue}>
                      {selected.subscores[bar.key].toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          <Card title="Methodology">
            <p className={styles.method}>
              The index takes the latest World Bank value for four indicators. GDP per capita
              uses a log scale so very rich countries do not flatten everyone else. Each
              indicator is normalized to a 0 to 100 range across the ranked countries. Lower is
              better for inflation and unemployment, so those scales are inverted, and inflation
              is capped at 30% so hyperinflation outliers do not distort the scale. The composite
              score is a weighted sum: GDP per capita 30%, life expectancy 30%, price stability
              20%, employment 20%. This is an educational index, not an official statistic.
            </p>
          </Card>
        </>
      )}
    </PageLayout>
  )
}
