// Deterministic observations generated from the series itself. No model and no
// API key involved: these are plain rules over the numbers on screen.

import type { IndicatorPoint } from '../../backend/worldbank'
import type { TranslationKey } from '../i18n'

type Translate = (key: TranslationKey, params?: Record<string, string | number>) => string

interface Options {
  format: (value: number) => string
  forecastNext?: number | null
}

export function buildInsights(
  points: IndicatorPoint[],
  t: Translate,
  options: Options,
): string[] {
  const facts = points.filter((point) => point.value !== null) as { year: number; value: number }[]
  if (facts.length < 3) return []

  const { format } = options
  const out: string[] = []
  const latest = facts[facts.length - 1]

  // A run of consecutive moves in the same direction.
  let streak = 0
  let rising = false
  for (let i = facts.length - 1; i > 0; i--) {
    const step = facts[i].value - facts[i - 1].value
    if (step === 0) break
    const stepUp = step > 0
    if (streak === 0) {
      rising = stepUp
      streak = 1
    } else if (stepUp === rising) {
      streak += 1
    } else {
      break
    }
  }
  if (streak >= 2) {
    out.push(t(rising ? 'insight.risingStreak' : 'insight.fallingStreak', { years: streak }))
  }

  // Where the newest reading sits against its own decade.
  const decade = facts.slice(-10)
  const average = decade.reduce((sum, point) => sum + point.value, 0) / decade.length
  if (Math.abs(latest.value - average) > Math.abs(average) * 0.1) {
    out.push(
      t('insight.vsDecade', {
        direction: t(latest.value > average ? 'insight.above' : 'insight.below'),
        average: format(average),
      }),
    )
  } else if (decade.length >= 5) {
    const window = facts.slice(-5).map((point) => point.value)
    const spread = Math.max(...window) - Math.min(...window)
    if (spread < Math.abs(average) * 0.25) out.push(t('insight.stable'))
  }

  // The peak of the visible history. Skip it when the peak is the first or the
  // last reading, where the sentence would just restate the obvious.
  const peak = facts.reduce((best, point) => (point.value > best.value ? point : best), facts[0])
  if (peak.year !== latest.year && peak.year !== facts[0].year) {
    out.push(
      t('insight.peak', {
        year: facts[0].year,
        value: format(peak.value),
        peakYear: peak.year,
      }),
    )
  }

  if (options.forecastNext !== null && options.forecastNext !== undefined) {
    const next = options.forecastNext
    out.push(
      t(next >= latest.value ? 'insight.forecastUp' : 'insight.forecastDown', {
        value: format(next),
      }),
    )
  }

  return out.slice(0, 3)
}
