import { useEffect, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, Star } from 'lucide-react'
import { LogoMark } from '../shared/components/Logo'
import { COUNTRY_NAMES_RU, countryName } from '../backend/constants'
import { pluralKey, useI18n } from '../shared/i18n'
import { useCountUp, usePrefersReducedMotion, useWatched } from './motion'
import type { HeroData } from './useHeroData'
import styles from './HeroPreview.module.css'

// A working picture of the product for the opening screen: the watchlist along
// the top, one country's inflation drawing itself, and underneath it the same
// figure turned into hours of work. Every number is the real one, fetched a
// moment ago from the World Bank.
//
// The reel moves to the next country every few seconds, but only while the
// picture is on screen and the tab is in front. With reduced motion it is a
// still of the first country.

const DWELL_MS = 5600

function nameOf(code: string, lang: string): string {
  return lang === 'ru' ? (COUNTRY_NAMES_RU[code] ?? countryName(code)) : countryName(code)
}

function linePoints(values: number[]): string {
  const low = Math.min(...values)
  const span = Math.max(...values) - low || 1
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100
      const y = 92 - ((value - low) / span) * 80
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
}

export default function HeroPreview({ data }: { data: HeroData }) {
  const { t, lang } = useI18n()
  const reduced = usePrefersReducedMotion()
  const { ref, watched } = useWatched<HTMLDivElement>()
  const [active, setActive] = useState(0)
  const count = data.countries.length

  useEffect(() => {
    if (!watched || reduced || count < 2) return
    const timer = setTimeout(() => setActive((index) => (index + 1) % count), DWELL_MS)
    return () => clearTimeout(timer)
  }, [active, count, reduced, watched])

  const country = data.countries[Math.min(active, Math.max(0, count - 1))]
  const hours = useCountUp(Math.round(country?.taxHours ?? 0), Boolean(country), 1100)

  return (
    <div ref={ref} className={styles.frame}>
      <p className={styles.sr}>{t('hero.previewAlt')}</p>

      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.brand}>
          <LogoMark className={styles.mark} />
          MacroScope
        </span>
        <span className={styles.live}>
          <i />
          {t('hero.previewLive')}
        </span>
      </div>

      <div className={styles.watch} aria-hidden="true">
        <Star size={11} strokeWidth={2} className={styles.star} />
        {(data.ready ? data.countries : []).map((item, index) => {
          const up = (item.delta ?? 0) >= 0
          const Arrow = up ? ArrowUpRight : ArrowDownRight
          return (
            <button
              key={item.code}
              type="button"
              tabIndex={-1}
              className={index === active ? `${styles.chip} ${styles.on}` : styles.chip}
              onClick={() => setActive(index)}
            >
              <span className={styles.code}>{item.code}</span>
              <span className={styles.value}>
                {item.latest ? `${(item.latest.value as number).toFixed(1)}%` : ''}
              </span>
              <Arrow size={11} strokeWidth={2.4} className={up ? styles.bad : styles.good} />
            </button>
          )
        })}
      </div>

      {country ? (
        <>
          <div className={styles.panel}>
            <div className={styles.panelHead}>
              <span>{t('hero.previewInflation', { country: nameOf(country.code, lang) })}</span>
              <span className={styles.years}>
                {`${country.history[0].year} — ${country.history[country.history.length - 1].year}`}
              </span>
            </div>
            <svg
              key={country.code}
              className={reduced ? styles.chart : `${styles.chart} ${styles.drawing}`}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="0" y1="92" x2="100" y2="92" className={styles.base} />
              <polyline
                points={linePoints(country.history.map((point) => point.value as number))}
                className={styles.line}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className={styles.tax}>
            <span className={styles.taxLabel}>{t('tax.title')}</span>
            <strong className={styles.taxValue}>
              {`${(country.taxHours ?? 0) >= 0 ? '+' : '−'}${Math.abs(hours)}`}
              <span className={styles.taxUnit}>
                {t(pluralKey(lang, hours, 'hero.unitOne', 'hero.unitFew', 'hero.unitMany'))}
              </span>
            </strong>
            <span className={styles.taxNote}>
              {country.taxBase === null
                ? ''
                : t((country.taxHours ?? 0) >= 0 ? 'hero.previewSince' : 'hero.previewSinceBack', {
                    year: country.taxBase,
                  })}
            </span>
          </div>

          <div className={styles.dots} aria-hidden="true">
            {data.countries.map((item, index) => (
              <i key={item.code} className={index === active ? styles.dotOn : undefined} />
            ))}
          </div>
        </>
      ) : (
        <div className={styles.placeholder} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  )
}
