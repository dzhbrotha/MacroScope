import { useEffect, useState } from 'react'
import { fetchIndicatorForCountriesFromApi } from '../backend/worldbank'
import type { IndicatorPoint } from '../backend/worldbank'
import { INDICATORS } from '../backend/constants'

// The landing page used to print invented numbers next to the words sample
// indicators. Real ones make the same point and prove the product works before
// anyone signs in.
//
// This talks to the World Bank directly rather than through the cache: the page
// is public, so there is no session to read the cache with, and a landing page
// must never wait on a database to paint.

const COUNTRY = 'KAZ'

export interface PulseRow {
  key: string
  value: number
  delta: number | null
  year: number
  /** Whether a rise is the welcome direction, used only to colour the change. */
  goodWhenUp: boolean
}

const SERIES: { key: string; code: string; goodWhenUp: boolean }[] = [
  { key: 'inflation', code: INDICATORS.inflation, goodWhenUp: false },
  { key: 'unemployment', code: INDICATORS.unemployment, goodWhenUp: false },
  { key: 'gdpGrowth', code: INDICATORS.gdpGrowth, goodWhenUp: true },
]

function rowOf(
  key: string,
  points: IndicatorPoint[] | undefined,
  goodWhenUp: boolean,
): PulseRow | null {
  const facts = (points ?? []).filter((point) => point.value !== null)
  if (facts.length === 0) return null
  const latest = facts[facts.length - 1]
  const previous = facts.length > 1 ? facts[facts.length - 2] : null
  return {
    key,
    value: latest.value as number,
    delta: previous === null ? null : (latest.value as number) - (previous.value as number),
    year: latest.year,
    goodWhenUp,
  }
}

export interface LivePulse {
  country: string
  rows: PulseRow[]
  /** Inflation, drawn as a line in the story panel. */
  history: IndicatorPoint[]
  /** Growth, drawn as bars in the pulse widget so the two are not the same picture. */
  growth: IndicatorPoint[]
  ready: boolean
  failed: boolean
}

export function useLivePulse(): LivePulse {
  const [state, setState] = useState<LivePulse>({
    country: COUNTRY,
    rows: [],
    history: [],
    growth: [],
    ready: false,
    failed: false,
  })

  useEffect(() => {
    let alive = true
    Promise.all(SERIES.map((item) => fetchIndicatorForCountriesFromApi([COUNTRY], item.code)))
      .then((results) => {
        if (!alive) return
        const rows = SERIES.map((item, index) =>
          rowOf(item.key, results[index][COUNTRY], item.goodWhenUp),
        ).filter((row): row is PulseRow => row !== null)
        const history = (results[0][COUNTRY] ?? []).filter((point) => point.value !== null)
        const growth = (results[2][COUNTRY] ?? []).filter((point) => point.value !== null)
        setState({
          country: COUNTRY,
          rows,
          history: history.slice(-20),
          growth: growth.slice(-14),
          ready: rows.length > 0,
          failed: rows.length === 0,
        })
      })
      .catch(() => {
        if (alive) setState((current) => ({ ...current, ready: false, failed: true }))
      })
    return () => {
      alive = false
    }
  }, [])

  return state
}
