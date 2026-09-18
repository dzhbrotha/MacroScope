import { useEffect, useState } from 'react'
import {
  fetchIndicatorForCountriesFromApi,
  fetchSourceUpdated,
  fetchWorldBankCountries,
} from '../backend/worldbank'
import type { IndicatorPoint } from '../backend/worldbank'
import { INDICATORS } from '../backend/constants'
import { computeHiddenTax } from '../app/modules/inflation/hiddenTax'

// Everything the opening screen shows, in two requests: inflation for the three
// countries the preview cycles through, and the date the World Bank last
// refreshed its database. Straight to the source rather than through the cache,
// because a landing page must never wait on a database to paint.

export const HERO_COUNTRIES = ['KAZ', 'USA', 'DEU'] as const

/** How far back the hidden tax in the preview is measured. */
const TAX_YEARS = 6

export interface HeroCountry {
  code: string
  history: IndicatorPoint[]
  latest: IndicatorPoint | null
  delta: number | null
  taxHours: number | null
  taxBase: number | null
}

export interface HeroData {
  countries: HeroCountry[]
  updated: string | null
  /** How many economies the World Bank list holds, counted rather than claimed. */
  economies: number | null
  ready: boolean
}

function summarise(code: string, points: IndicatorPoint[]): HeroCountry {
  const facts = points.filter((point) => point.value !== null)
  const latest = facts.length > 0 ? facts[facts.length - 1] : null
  const previous = facts.length > 1 ? facts[facts.length - 2] : null
  const base = latest ? latest.year - TAX_YEARS : null
  const tax = base !== null ? computeHiddenTax(facts, base) : null
  return {
    code,
    history: facts.slice(-21),
    latest,
    delta:
      latest && previous ? (latest.value as number) - (previous.value as number) : null,
    taxHours: tax ? tax.extraHours : null,
    taxBase: tax ? tax.baseYear : null,
  }
}

export function useHeroData(): HeroData {
  const [state, setState] = useState<HeroData>({
    countries: [],
    updated: null,
    economies: null,
    ready: false,
  })

  useEffect(() => {
    let alive = true
    fetchIndicatorForCountriesFromApi([...HERO_COUNTRIES], INDICATORS.inflation)
      .then((series) => {
        if (!alive) return
        const countries = HERO_COUNTRIES.map((code) => summarise(code, series[code] ?? [])).filter(
          (country) => country.history.length > 3,
        )
        setState((current) => ({ ...current, countries, ready: countries.length > 0 }))
      })
      .catch(() => {
        // The preview keeps its placeholder; the rest of the page does not care.
      })

    fetchSourceUpdated(INDICATORS.inflation)
      .then((updated) => {
        if (alive) setState((current) => ({ ...current, updated }))
      })
      .catch(() => {})

    fetchWorldBankCountries()
      .then((list) => {
        if (alive) setState((current) => ({ ...current, economies: list.length }))
      })
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [])

  return state
}
