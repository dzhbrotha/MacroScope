import { useEffect, useState } from 'react'
import { fetchWorldBankCountries } from '../backend/worldbank'
import { getIndicatorForCountries } from '../backend/indicators'
import { INDICATORS } from '../backend/constants'

// Inflation for every economy, every year, loaded once for the whole landing
// page. The ticker and the world map both read it, so the request is shared:
// whichever asks first starts it and the other gets the same promise.
//
// It goes through the cache, which anyone may read, and the cache falls back to
// the World Bank on its own. Nothing on the page waits for it: both views draw
// a placeholder until it lands.

export interface WorldCountry {
  code: string
  name: string
  lon: number
  lat: number
  /** Inflation by year. Years with no reading are absent, never zero. */
  byYear: Map<number, number>
  latest: { year: number; value: number } | null
  previous: number | null
}

export interface World {
  countries: WorldCountry[]
  firstYear: number
  lastYear: number
}

let shared: Promise<World> | null = null

function load(): Promise<World> {
  if (shared) return shared
  shared = (async () => {
    const list = await fetchWorldBankCountries()
    const placed = list.filter(
      (country): country is typeof country & { lon: number; lat: number } =>
        country.lon !== undefined && country.lat !== undefined,
    )
    const series = await getIndicatorForCountries(
      placed.map((country) => country.code),
      INDICATORS.inflation,
    )

    let firstYear = Infinity
    let lastYear = -Infinity
    const countries = placed.map((country) => {
      const byYear = new Map<number, number>()
      ;(series[country.code] ?? []).forEach((point) => {
        if (point.value === null) return
        byYear.set(point.year, point.value)
        firstYear = Math.min(firstYear, point.year)
        lastYear = Math.max(lastYear, point.year)
      })
      const years = [...byYear.keys()].sort((a, b) => a - b)
      const last = years[years.length - 1]
      const before = years[years.length - 2]
      return {
        code: country.code,
        name: country.name,
        lon: country.lon,
        lat: country.lat,
        byYear,
        latest: last === undefined ? null : { year: last, value: byYear.get(last) as number },
        previous: before === undefined ? null : (byYear.get(before) as number),
      }
    })

    if (!Number.isFinite(firstYear)) throw new Error('No inflation readings came back')
    return { countries, firstYear, lastYear }
  })().catch((error) => {
    // A failed load is not cached, so a later visit can try again.
    shared = null
    throw error
  })
  return shared
}

export function useWorldInflation(): World | null {
  const [world, setWorld] = useState<World | null>(null)

  useEffect(() => {
    let alive = true
    load()
      .then((result) => {
        if (alive) setWorld(result)
      })
      .catch(() => {
        // Both views keep their placeholder; the rest of the page is unaffected.
      })
    return () => {
      alive = false
    }
  }, [])

  return world
}
