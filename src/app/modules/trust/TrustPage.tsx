import { useMemo } from 'react'
import {
  Card,
  CountrySelect,
  EmptyState,
  ErrorState,
  PageLayout,
  Skeleton,
  SourceNote,
  Tooltip,
} from '../../../shared/components'
import { PinButton } from '../../../shared/watchlist'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { useQueryState } from '../../../shared/hooks/useQueryState'
import { getIndicatorForCountries } from '../../../backend/indicators'
import { INDICATORS, SPI } from '../../../backend/constants'
import { fetchWorldBankCountries } from '../../../backend/worldbank'
import type { IndicatorPoint } from '../../../backend/worldbank'
import { useCountries } from '../../../backend/CountriesProvider'
import { pluralKey, useI18n } from '../../../shared/i18n'
import type { TranslationKey } from '../../../shared/i18n'
import styles from './TrustPage.module.css'

// How far a number can be trusted, which is not the same question as whether
// anyone is lying.
//
// The tempting version of this module compares official inflation against some
// independent measure and calls the gap dishonesty. There is no independent
// series available to us, and the best known candidate has been shown to be
// the official index plus a constant rather than a measurement. Accusing
// governments on that basis would cost more credibility than it buys.
//
// So the question is narrowed to one that open data can answer: how well does
// this country's statistical system perform, and how old and how complete are
// the numbers this product is showing you. The first half is the World Bank's
// own published Statistical Performance Indicators; the second half we can see
// for ourselves in the series we serve.

const PILLARS: { code: string; label: TranslationKey; desc: TranslationKey }[] = [
  { code: SPI.dataUse, label: 'trust.pillar1', desc: 'trust.pillar1.desc' },
  { code: SPI.dataServices, label: 'trust.pillar2', desc: 'trust.pillar2.desc' },
  { code: SPI.dataProducts, label: 'trust.pillar3', desc: 'trust.pillar3.desc' },
  { code: SPI.dataSources, label: 'trust.pillar4', desc: 'trust.pillar4.desc' },
  { code: SPI.dataInfrastructure, label: 'trust.pillar5', desc: 'trust.pillar5.desc' },
]

const TRACKED: { code: string; label: TranslationKey }[] = [
  { code: INDICATORS.gdpPerCapita, label: 'ind.gdpPerCapita' },
  { code: INDICATORS.gdpGrowth, label: 'ind.gdpGrowth' },
  { code: INDICATORS.inflation, label: 'ind.inflation' },
  { code: INDICATORS.unemployment, label: 'ind.unemployment' },
  { code: INDICATORS.lifeExpectancy, label: 'ind.lifeExpectancy' },
  { code: INDICATORS.tradePercentGdp, label: 'ind.trade' },
  { code: INDICATORS.fdiInflows, label: 'ind.fdi' },
]

/** How many recent years a series is checked for holes. */
const WINDOW = 20

interface Latest {
  year: number
  value: number
}

function latestOf(points: IndicatorPoint[] | undefined): Latest | null {
  const facts = (points ?? []).filter((point) => point.value !== null)
  if (facts.length === 0) return null
  const last = facts[facts.length - 1]
  return { year: last.year, value: last.value as number }
}

interface TrustData {
  score: Latest | null
  rank: number | null
  ranked: number
  pillars: (Latest | null)[]
  coverage: { latest: Latest | null; gaps: number }[]
}

async function loadTrust(code: string): Promise<TrustData> {
  const countries = await fetchWorldBankCountries()
  const codes = countries.map((country) => country.code)

  const [all, pillarSeries, trackedSeries] = await Promise.all([
    getIndicatorForCountries(codes, SPI.overall),
    Promise.all(PILLARS.map((pillar) => getIndicatorForCountries([code], pillar.code))),
    Promise.all(TRACKED.map((item) => getIndicatorForCountries([code], item.code))),
  ])

  const scores = Object.entries(all)
    .map(([country, points]) => ({ country, latest: latestOf(points) }))
    .filter((row): row is { country: string; latest: Latest } => row.latest !== null)
    .sort((a, b) => b.latest.value - a.latest.value)

  const position = scores.findIndex((row) => row.country === code)

  // The coverage half is measured against the series this product actually
  // serves, so the reader is told about our own data and not a general claim.
  const thisYear = new Date().getFullYear()
  const coverage = TRACKED.map((_item, index) => {
    const points = trackedSeries[index][code] ?? []
    const latest = latestOf(points)
    const from = thisYear - WINDOW
    const known = new Set(
      points.filter((point) => point.value !== null).map((point) => point.year),
    )
    let gaps = 0
    for (let year = from; year <= (latest?.year ?? from); year += 1) {
      if (!known.has(year)) gaps += 1
    }
    return { latest, gaps }
  })

  return {
    score: latestOf(all[code]),
    rank: position >= 0 ? position + 1 : null,
    ranked: scores.length,
    pillars: PILLARS.map((_pillar, index) => latestOf(pillarSeries[index][code])),
    coverage,
  }
}

function toneOf(score: number): string {
  if (score >= 75) return styles.strong
  if (score >= 50) return styles.middling
  return styles.weak
}

export default function TrustPage() {
  const { t, lang } = useI18n()
  const { nameOf } = useCountries()
  const [country, setCountry] = useQueryState('country', 'KAZ')
  const label = nameOf(country)

  const { data, loading, error, reload } = useAsyncData(() => loadTrust(country), [country])

  const thisYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <PageLayout title={t('nav.trust')} subtitle={t('trust.subtitle')}>
      <div className={styles.controls}>
        <CountrySelect label={t('common.country')} value={country} onChange={setCountry} />
        <PinButton code={country} />
      </div>

      {loading ? (
        <>
          <Skeleton height={132} />
          <Skeleton height={240} />
        </>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || data.score === null ? (
        <EmptyState message={t('trust.empty', { country: label })} />
      ) : (
        <>
          <section className={styles.hero}>
            <div>
              <span className={styles.kicker}>{t('trust.scoreLabel')}</span>
              <strong className={`${styles.score} ${toneOf(data.score.value)}`}>
                {data.score.value.toFixed(1)}
              </strong>
              <span className={styles.outOf}>{t('trust.outOf', { year: data.score.year })}</span>
            </div>
            {data.rank !== null ? (
              <div className={styles.rankBox}>
                <span className={styles.kicker}>{t('trust.rank')}</span>
                <strong className={styles.rank}>
                  {t('trust.rankOf', { rank: data.rank, total: data.ranked })}
                </strong>
              </div>
            ) : null}
            <p className={styles.heroText}>{t('trust.heroText')}</p>
          </section>

          <Card title={t('trust.pillars')}>
            <div className={styles.pillars}>
              {PILLARS.map((pillar, index) => {
                const value = data.pillars[index]
                return (
                  <div key={pillar.code} className={styles.pillar}>
                    <span className={styles.pillarHead}>
                      <span className={styles.pillarName}>
                        {t(pillar.label)}
                        <Tooltip text={t(pillar.desc)} label={t(pillar.label)} />
                      </span>
                      <span className={styles.pillarValue}>
                        {value === null ? t('common.noData') : value.value.toFixed(1)}
                      </span>
                    </span>
                    <span className={styles.track}>
                      <i
                        className={value === null ? styles.fillEmpty : toneOf(value.value)}
                        style={{ width: `${value === null ? 0 : value.value}%` }}
                      />
                    </span>
                  </div>
                )
              })}
            </div>
            <p className={styles.note}>{t('trust.pillarsNote')}</p>
          </Card>

          <Card title={t('trust.coverage')}>
            <p className={styles.note}>{t('trust.coverageIntro', { window: WINDOW })}</p>
            <div className={styles.coverage}>
              {TRACKED.map((item, index) => {
                const row = data.coverage[index]
                const age = row.latest === null ? null : thisYear - row.latest.year
                return (
                  <div key={item.code} className={styles.covRow}>
                    <span className={styles.covName}>{t(item.label)}</span>
                    <span className={styles.covYear}>
                      {row.latest === null ? t('common.noData') : row.latest.year}
                    </span>
                    <span className={age !== null && age >= 3 ? styles.covStale : styles.covFresh}>
                      {age === null ? '' : t(pluralKey(lang, age, 'trust.ageOne', 'trust.ageFew', 'trust.ageMany'), { years: age })}
                    </span>
                    <span className={row.gaps > 0 ? styles.covStale : styles.covFresh}>
                      {t('trust.gaps', { count: row.gaps })}
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card title={t('trust.limits')}>
            <p className={styles.note}>{t('trust.limitsWhat')}</p>
            <p className={styles.note}>{t('trust.limitsNot')}</p>
            <p className={styles.note}>{t('trust.limitsOurs')}</p>
            <SourceNote codes={[SPI.overall, ...PILLARS.map((pillar) => pillar.code)]} />
          </Card>
        </>
      )}
    </PageLayout>
  )
}
