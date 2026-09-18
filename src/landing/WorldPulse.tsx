import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { COUNTRY_NAMES_RU } from '../backend/constants'
import { pluralKey, useI18n } from '../shared/i18n'
import SectionHeading from './SectionHeading'
import { usePrefersReducedMotion, useSeenOnce, useWatched } from './motion'
import { useWorldInflation } from './worldInflation'
import type { WorldCountry } from './worldInflation'
import styles from './WorldPulse.module.css'

// The world's inflation, every economy at once, one year per frame.
//
// There is no map file behind this. Each dot sits on the coordinates of a
// capital city as the World Bank publishes them, so the continents appear on
// their own out of two hundred points. The colour is that country's inflation
// in the year shown, on a heat scale: dim red for calm, white for runaway.
//
// It plays once by itself the first time it comes into view, only while it is
// on screen and the tab is in front, and never for anyone who asked for less
// motion. Every frame is a real year and every dot a real reading; a country
// with no reading for a year goes dark rather than being guessed.

const LAT_TOP = 72
const LAT_BOTTOM = -48
const WIDTH = 360
const HEIGHT = LAT_TOP - LAT_BOTTOM
const FRAME_MS = 480
/** How close, in degrees, the pointer must come for a dot to answer. */
const REACH = 5

/** Lower bounds of the heat bands, in percent. The first band is deflation. */
const BANDS = [-Infinity, 0, 2, 5, 10, 20, 50]
const BAND_LABELS = ['< 0', '0+', '2+', '5+', '10+', '20+', '50+']

function bandOf(value: number | undefined): number {
  if (value === undefined) return -1
  let band = 0
  for (let index = 0; index < BANDS.length; index += 1) {
    if (value >= BANDS[index]) band = index
  }
  return band
}

function project(country: WorldCountry): [number, number] {
  return [country.lon + 180, LAT_TOP - country.lat]
}

function formatRate(value: number): string {
  const size = Math.abs(value)
  const digits = size >= 100 ? 0 : 1
  return `${value.toFixed(digits)}%`
}

export default function WorldPulse() {
  const { t, lang } = useI18n()
  const navigate = useNavigate()
  const world = useWorldInflation()
  const reduced = usePrefersReducedMotion()
  const { ref: seenRef, seen } = useSeenOnce<HTMLDivElement>('0px 0px -25% 0px')
  const { ref: watchRef, watched } = useWatched<HTMLDivElement>()
  const svgRef = useRef<SVGSVGElement | null>(null)

  const years = useMemo(() => {
    if (!world) return []
    return Array.from(
      { length: world.lastYear - world.firstYear + 1 },
      (_, index) => world.firstYear + index,
    )
  }, [world])

  const [frame, setFrame] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [autoplayed, setAutoplayed] = useState(false)
  const [hover, setHover] = useState<{ code: string; x: number; y: number } | null>(null)

  // Until the reel is touched it rests on the latest year, which is the one a
  // reader who scrolls past without watching should still see.
  const index = frame ?? Math.max(0, years.length - 1)
  const year = years[index]
  const atEnd = index >= years.length - 1

  // The first sight of the map rolls the reel once, from the first year.
  useEffect(() => {
    if (autoplayed || !seen || reduced || years.length < 2) return
    setAutoplayed(true)
    setFrame(0)
    setPlaying(true)
  }, [autoplayed, reduced, seen, years.length])

  useEffect(() => {
    if (!playing || !watched) return
    const timer = window.setInterval(() => {
      setFrame((current) => {
        const next = (current ?? 0) + 1
        if (next >= years.length - 1) {
          setPlaying(false)
          return years.length - 1
        }
        return next
      })
    }, FRAME_MS)
    return () => window.clearInterval(timer)
  }, [playing, watched, years.length])

  const summary = useMemo(() => {
    if (!world || year === undefined) return null
    const readings = world.countries
      .map((country) => ({ country, value: country.byYear.get(year) }))
      .filter((row): row is { country: WorldCountry; value: number } => row.value !== undefined)
    if (readings.length === 0) return null
    const sorted = readings.map((row) => row.value).sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)
    const median =
      sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
    const highest = readings.reduce((best, row) => (row.value > best.value ? row : best))
    return {
      reporting: readings.length,
      above: readings.filter((row) => row.value > 10).length,
      median,
      highest,
    }
  }, [world, year])

  function nameOf(country: WorldCountry): string {
    return lang === 'ru' ? (COUNTRY_NAMES_RU[country.code] ?? country.name) : country.name
  }

  function nearest(event: { clientX: number; clientY: number }): WorldCountry | null {
    const svg = svgRef.current
    const matrix = svg?.getScreenCTM()
    if (!svg || !matrix || !world) return null
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse())
    let best: WorldCountry | null = null
    let bestDistance = REACH
    world.countries.forEach((country) => {
      const [x, y] = project(country)
      const distance = Math.hypot(x - point.x, y - point.y)
      if (distance < bestDistance) {
        bestDistance = distance
        best = country
      }
    })
    return best
  }

  function onPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const found = nearest(event)
    const box = event.currentTarget.getBoundingClientRect()
    setHover(
      found ? { code: found.code, x: event.clientX - box.left, y: event.clientY - box.top } : null,
    )
  }

  const hovered = hover && world ? world.countries.find((country) => country.code === hover.code) : null
  const hoveredValue = hovered && year !== undefined ? hovered.byYear.get(year) : undefined

  return (
    <section className={styles.band} id="world">
      <div className={styles.inner} ref={seenRef}>
        <SectionHeading
          index="01"
          eyebrow={t('world.eyebrow')}
          title={
            world ? t('world.title', { count: world.countries.length }) : t('world.titleIdle')
          }
          text={t('world.text', {
            from: years[0] ?? '',
            to: years[years.length - 1] ?? '',
          })}
        />

        <div className={styles.stage} ref={watchRef}>
          <div className={styles.head}>
            <span className={styles.year}>{year ?? ''}</span>

            <div className={styles.controls}>
              <button
                type="button"
                className={styles.play}
                disabled={years.length < 2}
                onClick={() => {
                  if (atEnd) {
                    setFrame(0)
                    setPlaying(true)
                    return
                  }
                  if (frame === null) setFrame(0)
                  setPlaying((current) => !current)
                }}
              >
                {atEnd && !playing ? (
                  <RotateCcw size={15} strokeWidth={2} />
                ) : playing ? (
                  <Pause size={15} strokeWidth={2} />
                ) : (
                  <Play size={15} strokeWidth={2} />
                )}
                <span>
                  {atEnd && !playing
                    ? t('replay.again')
                    : playing
                      ? t('replay.pause')
                      : t('replay.play')}
                </span>
              </button>
              <input
                className={styles.scrub}
                type="range"
                min={0}
                max={Math.max(0, years.length - 1)}
                value={index}
                disabled={years.length < 2}
                onChange={(event) => {
                  setPlaying(false)
                  setFrame(Number(event.target.value))
                }}
                aria-label={t('replay.scrub')}
              />
              <span className={styles.range}>
                {years.length > 0 ? `${years[0]} / ${years[years.length - 1]}` : ''}
              </span>
            </div>
          </div>

          <div className={styles.mapWrap}>
            <svg
              ref={svgRef}
              className={styles.map}
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="img"
              aria-label={t('world.mapLabel', { year: year ?? '' })}
              onPointerMove={onPointerMove}
              onPointerLeave={() => setHover(null)}
              onClick={(event) => {
                const found = nearest(event)
                if (found) navigate(`/app/inflation?country=${found.code}`)
              }}
              style={{ cursor: hover ? 'pointer' : 'default' }}
            >
              {[-120, -60, 0, 60, 120].map((lon) => (
                <line key={`lon${lon}`} x1={lon + 180} y1={0} x2={lon + 180} y2={HEIGHT} className={styles.grid} />
              ))}
              {[60, 30, -30].map((lat) => (
                <line key={`lat${lat}`} x1={0} y1={LAT_TOP - lat} x2={WIDTH} y2={LAT_TOP - lat} className={styles.grid} />
              ))}
              <line x1={0} y1={LAT_TOP} x2={WIDTH} y2={LAT_TOP} className={styles.equator} />

              {world
                ? world.countries.map((country) => {
                    const [x, y] = project(country)
                    const band = bandOf(year === undefined ? undefined : country.byYear.get(year))
                    return (
                      <circle
                        key={country.code}
                        cx={x}
                        cy={y}
                        r={1.35}
                        className={`${styles.dot} ${band < 0 ? styles.none : styles[`b${band}`]} ${
                          hover?.code === country.code ? styles.focus : ''
                        }`}
                      />
                    )
                  })
                : null}
            </svg>

            {!world ? <p className={styles.loading}>{t('world.loading')}</p> : null}

            {hovered && hover ? (
              <div
                className={styles.tip}
                style={{ left: hover.x, top: hover.y }}
                role="status"
              >
                <strong>{nameOf(hovered)}</strong>
                <span>
                  {hoveredValue === undefined
                    ? t('world.noReading', { year: year ?? '' })
                    : `${formatRate(hoveredValue)}, ${year}`}
                </span>
                <em>{t('world.tipOpen')}</em>
              </div>
            ) : null}
          </div>

          <div className={styles.foot}>
            <p className={styles.caption} aria-live="polite">
              {summary ? (
                <>
                  {t(pluralKey(lang, summary.above, 'world.aboveOne', 'world.aboveFew', 'world.aboveMany'), {
                    count: summary.above,
                  })}{' '}
                  {t('world.highest', {
                    country: nameOf(summary.highest.country),
                    value: formatRate(summary.highest.value),
                  })}{' '}
                  {t('world.median', { value: formatRate(summary.median) })}
                </>
              ) : (
                t('world.loading')
              )}
            </p>

            <ul className={styles.legend} aria-label={t('world.legend')}>
              {BAND_LABELS.map((label, band) => (
                <li key={label}>
                  <i className={styles[`b${band}`]} />
                  {label}
                </li>
              ))}
              <li>
                <i className={styles.none} />
                {t('world.none')}
              </li>
            </ul>
          </div>

          <p className={styles.note}>{t('world.note')}</p>
        </div>
      </div>
    </section>
  )
}
