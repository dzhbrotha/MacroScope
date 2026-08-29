// Cached indicator access. The only entry point modules should use.
// Flow: fresh cache row in Supabase -> return it.
// Otherwise fetch from the World Bank API and upsert into the cache.
// If the API fails but a stale cache row exists, return the stale data.

import { supabase } from './supabaseClient'
import { fetchIndicatorForCountriesFromApi, fetchIndicatorFromApi } from './worldbank'
import type { IndicatorPoint } from './worldbank'

const CACHE_MAX_AGE_DAYS = 30
const UPSERT_CHUNK = 50

function isFresh(fetchedAt: string): boolean {
  return (Date.now() - new Date(fetchedAt).getTime()) / 86_400_000 < CACHE_MAX_AGE_DAYS
}

// The cache is readable by anyone but only a signed in reader may warm it.
// Without this check every anonymous visit fired four writes that the database
// refused, which is four wasted round trips and four errors in the console.
async function canWriteCache(): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession()
    return data.session !== null
  } catch {
    return false
  }
}

async function writeCache(
  indicatorCode: string,
  series: Record<string, IndicatorPoint[]>,
): Promise<void> {
  if (!(await canWriteCache())) return

  const rows = Object.entries(series)
    .filter(([, points]) => points.length > 0)
    .map(([countryCode, points]) => ({
      country_code: countryCode,
      indicator_code: indicatorCode,
      data: points,
      fetched_at: new Date().toISOString(),
    }))

  for (let start = 0; start < rows.length; start += UPSERT_CHUNK) {
    const chunk = rows.slice(start, start + UPSERT_CHUNK)
    try {
      const { error } = await supabase
        .from('indicator_cache')
        .upsert(chunk, { onConflict: 'country_code,indicator_code' })
      if (error) {
        console.warn('Indicator cache write failed:', error.message)
        return
      }
    } catch (error) {
      console.warn('Indicator cache write failed:', error)
      return
    }
  }
}

export async function getIndicator(
  countryCode: string,
  indicatorCode: string,
): Promise<IndicatorPoint[]> {
  const series = await getIndicatorForCountries([countryCode], indicatorCode)
  return series[countryCode] ?? []
}

// One cache query and one API request for the whole list, rather than a pair
// per country. Building the quality of life index used to mean hundreds of
// round trips; it is now four.
export async function getIndicatorForCountries(
  countryCodes: string[],
  indicatorCode: string,
): Promise<Record<string, IndicatorPoint[]>> {
  if (countryCodes.length === 0) return {}

  const fresh: Record<string, IndicatorPoint[]> = {}
  const stale = new Map<string, IndicatorPoint[]>()

  try {
    const { data, error } = await supabase
      .from('indicator_cache')
      .select('country_code, data, fetched_at')
      .eq('indicator_code', indicatorCode)
      .in('country_code', countryCodes)

    if (error) {
      console.warn('Indicator cache read failed:', error.message)
    } else {
      ;(data ?? []).forEach((row) => {
        const points = row.data as IndicatorPoint[]
        if (isFresh(row.fetched_at)) fresh[row.country_code] = points
        else stale.set(row.country_code, points)
      })
    }
  } catch (error) {
    console.warn('Indicator cache read failed:', error)
  }

  const missing = countryCodes.filter((code) => !(code in fresh))

  if (missing.length > 0) {
    try {
      const fetched = await fetchIndicatorForCountriesFromApi(missing, indicatorCode)
      Object.assign(fresh, fetched)
      void writeCache(indicatorCode, fetched)
    } catch (error) {
      console.warn(`Indicator unavailable for ${indicatorCode}:`, error)
      missing.forEach((code) => {
        fresh[code] = stale.get(code) ?? []
      })
    }
  }

  return Object.fromEntries(countryCodes.map((code) => [code, fresh[code] ?? []]))
}

// Kept for callers that want to bypass the cache entirely.
export { fetchIndicatorFromApi }
