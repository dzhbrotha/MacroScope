import { useMemo, useState } from 'react'
import {
  Card,
  CountrySelect,
  EmptyState,
  ErrorState,
  PageLayout,
  Skeleton,
  SourceNote,
} from '../../../shared/components'
import { PinButton } from '../../../shared/watchlist'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { useQueryState } from '../../../shared/hooks/useQueryState'
import { getIndicatorForCountries } from '../../../backend/indicators'
import { INDICATORS, COUNTRY_NAMES_RU } from '../../../backend/constants'
import { fetchWorldBankCountries } from '../../../backend/worldbank'
import type { IndicatorPoint } from '../../../backend/worldbank'
import { useCountries } from '../../../backend/CountriesProvider'
import { pluralKey, useI18n } from '../../../shared/i18n'
import styles from './IncomePage.module.css'

// Where a wage stands against the whole world, on one rule.
//
// The honest caveat is the point of the module rather than a footnote. GDP per
// capita is everything a country produced divided by everyone in it, not a
// wage: in rich countries a typical income sits below it, in poor ones closer
// to it. The page says so and still gives the reader the one line they came
// for, because the comparison is worth making as long as nobody is told it is
// something it is not.
//
// Income is entered in the reader's own currency and converted with the World
// Bank's purchasing power parity factor, which is the only conversion that
// makes a wage in tenge comparable with output per person in Chile.

const MONTHS = 12

interface Economy {
  code: string
  name: string
  value: number
}

interface IncomeData {
  economies: Economy[]
  /** Local currency units per international dollar, for the chosen country. */
  factor: number | null
  factorYear: number | null
  ownValue: number | null
  year: number | null
}

function latestOf(points: IndicatorPoint[] | undefined): IndicatorPoint | null {
  const facts = (points ?? []).filter((point) => point.value !== null)
  return facts.length > 0 ? facts[facts.length - 1] : null
}

async function loadIncome(code: string): Promise<IncomeData> {
  const countries = await fetchWorldBankCountries()
  const codes = countries.map((country) => country.code)
  const [output, ppp] = await Promise.all([
    getIndicatorForCountries(codes, INDICATORS.gdpPerCapitaPpp),
    getIndicatorForCountries([code], INDICATORS.pppFactor),
  ])

  const economies = countries
    .map((country) => {
      const latest = latestOf(output[country.code])
      return latest ? { code: country.code, name: country.name, value: latest.value as number } : null
    })
    .filter((row): row is Economy => row !== null)
    .sort((a, b) => a.value - b.value)

  const factor = latestOf(ppp[code])
  const own = latestOf(output[code])
  return {
    economies,
    factor: factor ? (factor.value as number) : null,
    factorYear: factor ? factor.year : null,
    ownValue: own ? (own.value as number) : null,
    year: own ? own.year : null,
  }
}

function money(value: number): string {
  return Math.round(value).toLocaleString('en-US').replace(/,/g, ' ')
}

export default function IncomePage() {
  const { t, lang } = useI18n()
  const { nameOf } = useCountries()
  const [country, setCountry] = useQueryState('country', 'KAZ')
  const [typed, setTyped] = useQueryState('income', '')

  const { data, loading, error, reload } = useAsyncData(() => loadIncome(country), [country])

  // Until the reader types anything the rule starts at their own country's
  // output per person, which is a real number rather than an invented one.
  const suggested = useMemo(() => {
    if (!data || data.ownValue === null || data.factor === null) return null
    return Math.round((data.ownValue * data.factor) / MONTHS)
  }, [data])

  // Until the reader touches the field the box carries that suggestion. Once
  // they do, an empty box stays empty: snapping the number back the moment the
  // last digit is deleted makes the field feel broken.
  // A shared link already carries the number, so that counts as touched.
  const [touched, setTouched] = useState(typed !== '')
  const shown = touched ? typed : suggested === null ? '' : String(suggested)
  const monthly = shown.trim() === '' ? suggested : Number(shown.replace(/[^\d.]/g, ''))
  const annualIntl =
    monthly !== null && Number.isFinite(monthly) && data?.factor
      ? (monthly * MONTHS) / data.factor
      : null

  const standing = useMemo(() => {
    if (!data || annualIntl === null || data.economies.length === 0) return null
    const below = data.economies.filter((economy) => economy.value < annualIntl).length
    const index = below
    return {
      below,
      total: data.economies.length,
      under: data.economies.slice(Math.max(0, index - 3), index).reverse(),
      over: data.economies.slice(index, index + 3),
    }
  }, [data, annualIntl])

  // A logarithmic rule: output per person spans three orders of magnitude, and
  // on a linear axis every country but the richest would sit on the left edge.
  const scale = useMemo(() => {
    if (!data || data.economies.length < 2) return null
    const low = Math.log10(data.economies[0].value)
    const high = Math.log10(data.economies[data.economies.length - 1].value)
    return (value: number) => ((Math.log10(value) - low) / (high - low)) * 100
  }, [data])

  const displayName = (economy: Economy) =>
    lang === 'ru' ? (COUNTRY_NAMES_RU[economy.code] ?? economy.name) : economy.name

  return (
    <PageLayout title={t('nav.income')} subtitle={t('income.subtitle')}>
      <div className={styles.controls}>
        <CountrySelect label={t('income.yourCountry')} value={country} onChange={setCountry} />
        <label className={styles.field}>
          <span>{t('income.monthly')}</span>
          <input
            className={styles.input}
            inputMode="numeric"
            value={shown}
            onChange={(event) => {
              setTouched(true)
              setTyped(event.target.value.replace(/[^\d ]/g, ''))
            }}
            placeholder={suggested === null ? '' : String(suggested)}
          />
        </label>
        <PinButton code={country} />
      </div>

      {loading ? (
        <>
          <Skeleton height={150} />
          <Skeleton height={220} />
        </>
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : !data || !standing || !scale || annualIntl === null || data.factor === null ? (
        <EmptyState message={t('income.empty', { country: nameOf(country) })} />
      ) : (
        <>
          <section className={styles.headline}>
            <span className={styles.kicker}>{t('income.standingLabel')}</span>
            <strong className={styles.big}>
              {t(
                pluralKey(lang, standing.below, 'income.ofOne', 'income.ofFew', 'income.ofMany'),
                { count: standing.below, total: standing.total },
              )}
            </strong>
            <p className={styles.lead}>
              {t('income.lead', {
                intl: money(annualIntl),
                year: data.year ?? '',
              })}
            </p>
          </section>

          <Card title={t('income.rule')}>
            <div className={styles.ruleWrap}>
              <div className={styles.rule}>
                {data.economies.map((economy) => (
                  <i
                    key={economy.code}
                    className={economy.code === country ? styles.tickOwn : styles.tick}
                    style={{ left: `${scale(economy.value)}%` }}
                    title={`${displayName(economy)}: $${money(economy.value)}`}
                  />
                ))}
                <span className={styles.marker} style={{ left: `${scale(annualIntl)}%` }}>
                  <b />
                  <em>{t('income.you')}</em>
                </span>
              </div>
              <div className={styles.ruleScale}>
                <span>${money(data.economies[0].value)}</span>
                <span>${money(data.economies[data.economies.length - 1].value)}</span>
              </div>
            </div>

            <div className={styles.neighbours}>
              <div>
                <span className={styles.colLabel}>{t('income.justBelow')}</span>
                {standing.under.map((economy) => (
                  <p key={economy.code}>
                    <span>{displayName(economy)}</span>
                    <b>${money(economy.value)}</b>
                  </p>
                ))}
              </div>
              <div>
                <span className={styles.colLabel}>{t('income.justAbove')}</span>
                {standing.over.map((economy) => (
                  <p key={economy.code}>
                    <span>{displayName(economy)}</span>
                    <b>${money(economy.value)}</b>
                  </p>
                ))}
              </div>
            </div>
          </Card>

          <Card title={t('income.readThis')}>
            <p className={styles.note}>{t('income.noteWhat')}</p>
            <p className={styles.note}>
              {t('income.noteConversion', {
                factor: data.factor.toFixed(1),
                year: data.factorYear ?? '',
                country: nameOf(country),
              })}
            </p>
            <SourceNote codes={[INDICATORS.gdpPerCapitaPpp, INDICATORS.pppFactor]} />
          </Card>
        </>
      )}
    </PageLayout>
  )
}
