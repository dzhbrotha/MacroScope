import { useEffect, useMemo, useState } from 'react'
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import type { IndicatorPoint } from '../../../backend/worldbank'
import { pluralKey, useI18n } from '../../../shared/i18n'
import styles from './ReplayPlayer.module.css'

// Replay of a shock, year by year.
//
// A before and after pair says what changed. It does not say when, or in what
// order, and order is most of the story: trade turns first, investment later,
// growth last. Pressing play walks the years from the one before the shock and
// names, each frame, whichever indicator moved most.
//
// The frames are years because the underlying series are annual. There is no
// day one here and the panel says so, rather than inventing intermediate
// points to make the animation smoother.

const FRAME_MS = 1200
const HORIZON = 6

export interface ReplaySeries {
  key: string
  name: string
  unit: string
  points: IndicatorPoint[]
  /** Whether a rise is the welcome direction, used only to colour the move. */
  goodWhenUp: boolean
}

interface ReplayPlayerProps {
  series: ReplaySeries[]
  shockYear: number
}

function valueAt(points: IndicatorPoint[], year: number): number | null {
  const found = points.find((point) => point.year === year)
  return found?.value ?? null
}

export default function ReplayPlayer({ series, shockYear }: ReplayPlayerProps) {
  const { t, lang } = useI18n()

  const years = useMemo(() => {
    let last = shockYear
    series.forEach((item) => {
      item.points.forEach((point) => {
        if (point.value !== null && point.year > last) last = point.year
      })
    })
    const end = Math.min(last, shockYear + HORIZON)
    const start = shockYear - 1
    if (end <= start) return [start]
    return Array.from({ length: end - start + 1 }, (_, index) => start + index)
  }, [series, shockYear])

  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(false)

  // A new country or a new event restarts the reel rather than leaving the
  // playhead pointing at a year the new series may not even have.
  useEffect(() => {
    setFrame(0)
    setPlaying(false)
  }, [shockYear, series])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setFrame((current) => {
        if (current >= years.length - 1) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, FRAME_MS)
    return () => window.clearInterval(timer)
  }, [playing, years.length])

  const baselineYear = years[0]
  const year = years[Math.min(frame, years.length - 1)]
  const elapsed = year - shockYear

  const rows = useMemo(
    () =>
      series.map((item) => {
        const now = valueAt(item.points, year)
        const base = valueAt(item.points, baselineYear)
        const previous = valueAt(item.points, year - 1)
        return {
          item,
          now,
          sinceBase: now !== null && base !== null ? now - base : null,
          step: now !== null && previous !== null ? now - previous : null,
        }
      }),
    [series, year, baselineYear],
  )

  // The caption is computed, never written: whichever indicator moved most
  // this year is the one the frame is about.
  const mover = useMemo(() => {
    const moved = rows.filter((row) => row.step !== null)
    if (moved.length === 0) return null
    return moved.reduce((best, row) =>
      Math.abs(row.step as number) > Math.abs(best.step as number) ? row : best,
    )
  }, [rows])

  const atEnd = frame >= years.length - 1

  function step(by: number) {
    setPlaying(false)
    setFrame((current) => Math.min(years.length - 1, Math.max(0, current + by)))
  }

  return (
    <div className={styles.player}>
      <header className={styles.head}>
        <div className={styles.clock}>
          <span className={styles.year}>{year}</span>
          <span className={styles.elapsed}>
            {elapsed < 0
              ? t('replay.before')
              : elapsed === 0
                ? t('replay.shock')
                : t(
                    pluralKey(lang, elapsed, 'replay.afterOne', 'replay.afterFew', 'replay.afterMany'),
                    { years: elapsed },
                  )}
          </span>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.control}
            onClick={() => step(-1)}
            disabled={frame === 0}
            aria-label={t('replay.back')}
          >
            <SkipBack size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            className={`${styles.control} ${styles.primary}`}
            onClick={() => {
              if (atEnd) {
                setFrame(0)
                setPlaying(true)
                return
              }
              setPlaying((current) => !current)
            }}
            aria-label={playing ? t('replay.pause') : t('replay.play')}
          >
            {atEnd ? (
              <RotateCcw size={15} strokeWidth={2} />
            ) : playing ? (
              <Pause size={15} strokeWidth={2} />
            ) : (
              <Play size={15} strokeWidth={2} />
            )}
            <span>{atEnd ? t('replay.again') : playing ? t('replay.pause') : t('replay.play')}</span>
          </button>
          <button
            type="button"
            className={styles.control}
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label={t('replay.forward')}
          >
            <SkipForward size={15} strokeWidth={2} />
          </button>
        </div>
      </header>

      <input
        className={styles.scrub}
        type="range"
        min={0}
        max={Math.max(0, years.length - 1)}
        value={frame}
        onChange={(event) => {
          setPlaying(false)
          setFrame(Number(event.target.value))
        }}
        aria-label={t('replay.scrub')}
      />

      <div className={styles.ticks} aria-hidden="true">
        {years.map((item) => (
          <span key={item} className={item === year ? styles.tickOn : styles.tick}>
            {item === shockYear ? '▲' : '·'}
          </span>
        ))}
      </div>

      <div className={styles.rows}>
        {rows.map((row) => {
          const welcome =
            row.sinceBase === null ? null : row.sinceBase >= 0 === row.item.goodWhenUp
          return (
            <div key={row.item.key} className={styles.row}>
              <span className={styles.name}>{row.item.name}</span>
              <span className={styles.now}>
                {row.now === null
                  ? t('common.noData')
                  : `${row.now.toFixed(1)}${row.item.unit}`}
              </span>
              <span
                className={
                  row.sinceBase === null
                    ? styles.flat
                    : welcome
                      ? `${styles.since} ${styles.good}`
                      : `${styles.since} ${styles.bad}`
                }
              >
                {row.sinceBase === null
                  ? ''
                  : `${row.sinceBase >= 0 ? '+' : ''}${row.sinceBase.toFixed(1)} ${t('replay.pp')}`}
              </span>
            </div>
          )
        })}
      </div>

      <p className={styles.caption}>
        {elapsed < 0
          ? t('replay.captionBase', { year: baselineYear })
          : mover && mover.step !== null
            ? t('replay.caption', {
                name: mover.item.name,
                delta: `${mover.step >= 0 ? '+' : ''}${mover.step.toFixed(1)}`,
              })
            : t('replay.captionQuiet')}
      </p>

      <p className={styles.note}>{t('replay.note')}</p>
    </div>
  )
}
