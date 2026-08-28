import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowDownRight, ArrowUpRight, Minus, Star, X } from 'lucide-react'
import { useCountries } from '../../backend/CountriesProvider'
import { getIndicatorForCountries } from '../../backend/indicators'
import { INDICATORS } from '../../backend/constants'
import type { IndicatorPoint } from '../../backend/worldbank'
import { useAsyncData } from '../hooks/useAsyncData'
import { rememberQueryState } from '../hooks/useQueryState'
import { countryTarget } from '../lib/countryRoute'
import { useI18n } from '../i18n'
import { useWatchlist } from './WatchlistProvider'
import styles from './WatchlistBar.module.css'

interface Quote {
  code: string
  value: number | null
  delta: number | null
  year: number | null
}

function quoteOf(code: string, points: IndicatorPoint[] | undefined): Quote {
  const facts = (points ?? []).filter((point) => point.value !== null)
  if (facts.length === 0) return { code, value: null, delta: null, year: null }
  const latest = facts[facts.length - 1]
  const previous = facts.length > 1 ? facts[facts.length - 2] : null
  return {
    code,
    value: latest.value as number,
    delta: previous === null ? null : (latest.value as number) - (previous.value as number),
    year: latest.year,
  }
}

export default function WatchlistBar() {
  const { t } = useI18n()
  const { nameOf } = useCountries()
  const { codes, remove } = useWatchlist()
  const navigate = useNavigate()
  const location = useLocation()

  // One request covers the whole strip, however many countries are pinned.
  const { data } = useAsyncData(
    () =>
      codes.length === 0
        ? Promise.resolve({} as Record<string, IndicatorPoint[]>)
        : getIndicatorForCountries(codes, INDICATORS.inflation),
    [codes.join('|')],
  )

  function open(code: string) {
    rememberQueryState('country', code)
    navigate(countryTarget(location.pathname, location.search, code), { replace: true })
  }

  if (codes.length === 0) {
    return (
      <div className={styles.bar}>
        <span className={styles.kicker}>
          <Star size={12} strokeWidth={2} />
          {t('watch.title')}
        </span>
        <p className={styles.empty}>{t('watch.empty')}</p>
      </div>
    )
  }

  const active = new URLSearchParams(location.search).get('country')

  return (
    <div className={styles.bar}>
      <span className={styles.kicker}>
        <Star size={12} strokeWidth={2} />
        {t('watch.title')}
      </span>

      <div className={styles.rail}>
        {codes.map((code) => {
          const quote = quoteOf(code, data?.[code])
          const Arrow =
            quote.delta === null ? Minus : quote.delta >= 0 ? ArrowUpRight : ArrowDownRight
          const tone =
            quote.delta === null ? styles.flat : quote.delta >= 0 ? styles.up : styles.down
          return (
            <div
              key={code}
              className={code === active ? `${styles.chip} ${styles.on}` : styles.chip}
            >
              <button type="button" className={styles.pick} onClick={() => open(code)}>
                <span className={styles.code}>{code}</span>
                <span className={styles.name}>{nameOf(code)}</span>
                <span className={styles.quote}>
                  {quote.value === null ? (
                    <span className={styles.flat}>{t('common.noData')}</span>
                  ) : (
                    <>
                      <span className={styles.value}>{quote.value.toFixed(1)}%</span>
                      <span className={tone}>
                        <Arrow size={12} strokeWidth={2.25} />
                      </span>
                    </>
                  )}
                </span>
              </button>
              <button
                type="button"
                className={styles.unpin}
                onClick={() => remove(code)}
                aria-label={t('watch.remove', { country: nameOf(code) })}
              >
                <X size={12} strokeWidth={2.25} />
              </button>
            </div>
          )
        })}
      </div>

      <span className={styles.legend}>{t('watch.legend')}</span>
    </div>
  )
}
