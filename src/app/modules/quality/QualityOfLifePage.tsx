import { useMemo, useState } from 'react'
import { Globe2, Search } from 'lucide-react'
import {
  Card,
  EmptyState,
  ErrorState,
  ExportBar,
  LoadingState,
  PageLayout,
  Table,
  Tooltip,
} from '../../../shared/components'
import type { TableColumn } from '../../../shared/components'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { useQueryState } from '../../../shared/hooks/useQueryState'
import { getIndicatorForCountries } from '../../../backend/indicators'
import { INDICATORS } from '../../../backend/constants'
import { fetchWorldBankCountries, type IndicatorPoint } from '../../../backend/worldbank'
import { useCountries } from '../../../backend/CountriesProvider'
import { downloadCsv } from '../../../shared/lib/exportData'
import { useI18n } from '../../../shared/i18n'
import type { TranslationKey } from '../../../shared/i18n'
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

const BAR_ROWS: { key: 'gdp' | 'life' | 'inflation' | 'unemployment'; label: TranslationKey; desc: TranslationKey; weight: number }[] = [
  { key: 'gdp', label: 'quality.barGdp', desc: 'ind.gdpPerCapita.desc', weight: WEIGHTS.gdp },
  { key: 'life', label: 'quality.barLife', desc: 'ind.lifeExpectancy.desc', weight: WEIGHTS.life },
  { key: 'inflation', label: 'quality.barInflation', desc: 'ind.inflation.desc', weight: WEIGHTS.inflation },
  { key: 'unemployment', label: 'quality.barEmployment', desc: 'ind.unemployment.desc', weight: WEIGHTS.unemployment },
]

export default function QualityOfLifePage() {
  const { t } = useI18n()
  const { nameOf } = useCountries()
  const { data, loading, error, reload } = useAsyncData(loadMetrics, [])
  const [query, setQuery] = useState('')
  const [selectedCode, setSelectedCode] = useQueryState('country', '')

  const result = useMemo(() => (data ? computeScores(data) : null), [data])
  // 177 rows with no way to find your own country was the main complaint here.
  const rows = useMemo(() => {
    if (!result) return []
    const needle = query.trim().toLowerCase()
    if (!needle) return result.scored
    return result.scored.filter(
      (row) =>
        nameOf(row.code).toLowerCase().includes(needle) ||
        row.name.toLowerCase().includes(needle) ||
        row.code.toLowerCase().includes(needle),
    )
  }, [result, query, nameOf])

  const selected: ScoredCountry | null = result
    ? (result.scored.find((row) => row.code === selectedCode) ?? result.scored[0] ?? null)
    : null

  const columns: TableColumn<ScoredCountry>[] = [
    { key: 'rank', header: t('quality.rank'), render: (row) => row.rank },
    {
      key: 'name',
      header: t('common.country'),
      render: (row) => (
        <button className={styles.countryLink} onClick={() => setSelectedCode(row.code)}>
          {nameOf(row.code)}
        </button>
      ),
    },
    {
      key: 'score',
      header: t('quality.score'),
      align: 'right',
      render: (row) => <span className={styles.score}>{row.score.toFixed(1)}</span>,
    },
    {
      key: 'gdp',
      header: t('ind.gdpPerCapita'),
      align: 'right',
      render: (row) => `$${Math.round(row.gdpPerCapita as number).toLocaleString('en-US')}`,
    },
    {
      key: 'life',
      header: t('ind.lifeExpectancy'),
      align: 'right',
      render: (row) => `${(row.lifeExpectancy as number).toFixed(1)}`,
    },
    {
      key: 'inflation',
      header: t('ind.inflation'),
      align: 'right',
      render: (row) => `${(row.inflation as number).toFixed(1)}%`,
    },
    {
      key: 'unemployment',
      header: t('ind.unemployment'),
      align: 'right',
      render: (row) => `${(row.unemployment as number).toFixed(1)}%`,
    },
  ]

  function exportCsv() {
    if (!result) return
    downloadCsv('macroscope-quality-of-life.csv', [
      [
        t('quality.rank'),
        t('common.country'),
        t('quality.score'),
        t('ind.gdpPerCapita'),
        t('ind.lifeExpectancy'),
        t('ind.inflation'),
        t('ind.unemployment'),
      ],
      ...result.scored.map((row) => [
        row.rank,
        row.name,
        row.score,
        row.gdpPerCapita,
        row.lifeExpectancy,
        row.inflation,
        row.unemployment,
      ]),
    ])
  }

  return (
    <PageLayout title={t('nav.quality')} subtitle={t('quality.subtitle')}>
      {loading ? (
        <LoadingState label={t('quality.loading')} />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !result || result.scored.length === 0 ? (
        <EmptyState icon={Globe2} message={t('quality.empty')} />
      ) : (
        <>
          <Card title={t('quality.ranking', { count: result.scored.length })}>
            <div className={styles.searchRow}>
              <Search size={15} strokeWidth={2} className={styles.searchIcon} />
              <input
                className={styles.search}
                value={query}
                placeholder={t('quality.filter')}
                onChange={(event) => setQuery(event.target.value)}
              />
              <span className={styles.count}>
                {t('quality.shown', { shown: rows.length, total: result.scored.length })}
              </span>
            </div>
            {rows.length === 0 ? (
              <p className={styles.note}>{t('common.searchEmpty')}</p>
            ) : (
              <Table columns={columns} rows={rows} rowKey={(row) => row.code} />
            )}
            {result.excluded.length > 0 ? (
              <p className={styles.note}>
                {t('quality.excluded', { list: result.excluded.slice(0, 12).join(', ') })}
              </p>
            ) : null}
            <div className={styles.exportRow}>
              <ExportBar onCsv={exportCsv} />
            </div>
          </Card>

          {selected ? (
            <Card
              title={t('quality.rankOf', {
                country: nameOf(selected.code),
                rank: selected.rank,
                total: result.scored.length,
              })}
            >
              <div className={styles.detailScore}>
                <span className={styles.detailValue}>{selected.score.toFixed(1)}</span>
                <span className={styles.detailLabel}>{t('quality.composite')}</span>
              </div>
              <div className={styles.bars}>
                {BAR_ROWS.map((bar) => (
                  <div key={bar.key} className={styles.barRow}>
                    <span className={styles.barLabel}>
                      <span>
                        {t(bar.label)}
                        <Tooltip text={t(bar.desc)} label={t(bar.label)} />
                      </span>
                      <span className={styles.barWeight}>
                        {t('quality.weight', { percent: Math.round(bar.weight * 100) })}
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

          <Card title={t('quality.methodology')}>
            <p className={styles.method}>{t('quality.methodologyText')}</p>
          </Card>
        </>
      )}
    </PageLayout>
  )
}
