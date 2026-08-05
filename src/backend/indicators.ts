// Cached indicator access. The only entry point modules should use.
// Flow: fresh cache row in Supabase -> return it.
// Otherwise fetch from the World Bank API and upsert into the cache.
// If the API fails but a stale cache row exists, return the stale data.

import { supabase } from './supabaseClient'
import { fetchIndicatorFromApi } from './worldbank'
import type { IndicatorPoint } from './worldbank'

const CACHE_MAX_AGE_DAYS = 30

export async function getIndicator(
  countryCode: string,
  indicatorCode: string,
): Promise<IndicatorPoint[]> {
  const { data: cached } = await supabase
    .from('indicator_cache')
    .select('data, fetched_at')
    .eq('country_code', countryCode)
    .eq('indicator_code', indicatorCode)
    .maybeSingle()

  if (cached) {
    const ageDays = (Date.now() - new Date(cached.fetched_at).getTime()) / 86_400_000
    if (ageDays < CACHE_MAX_AGE_DAYS) {
      return cached.data as IndicatorPoint[]
    }
  }

  let points: IndicatorPoint[]
  try {
    points = await fetchIndicatorFromApi(countryCode, indicatorCode)
  } catch (error) {
    if (cached) return cached.data as IndicatorPoint[]
    throw error
  }

  const { error: cacheError } = await supabase.from('indicator_cache').upsert(
    {
      country_code: countryCode,
      indicator_code: indicatorCode,
      data: points,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: 'country_code,indicator_code' },
  )
  if (cacheError) {
    console.warn('Indicator cache write failed:', cacheError.message)
  }

  return points
}

export async function getIndicatorForCountries(
  countryCodes: string[],
  indicatorCode: string,
): Promise<Record<string, IndicatorPoint[]>> {
  const results = await Promise.all(countryCodes.map(async (code) => {
    try {
      return await getIndicator(code, indicatorCode)
    } catch (error) {
      console.warn(`Indicator unavailable for ${code}/${indicatorCode}:`, error)
      return []
    }
  }))
  return Object.fromEntries(countryCodes.map((code, index) => [code, results[index]]))
}
