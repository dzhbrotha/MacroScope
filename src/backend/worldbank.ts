// Direct access to the open World Bank API. No key required.
// Modules should not import this file directly: use indicators.ts,
// which adds the Supabase cache on top.

export interface IndicatorPoint {
  year: number
  value: number | null
}

export interface WorldBankCountry {
  code: string
  name: string
}

const API_BASE = 'https://api.worldbank.org/v2'
const FIRST_YEAR = 1990
// Asking up to the current year means new releases appear without a code change.
const lastYear = () => new Date().getFullYear()

let countriesPromise: Promise<WorldBankCountry[]> | null = null

export function fetchWorldBankCountries(): Promise<WorldBankCountry[]> {
  if (countriesPromise) return countriesPromise
  countriesPromise = fetch(`${API_BASE}/country?format=json&per_page=400`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`World Bank country list error: ${response.status}`)
      const payload = (await response.json()) as [unknown, Array<{ id: string; name: string; region?: { id: string } }>]
      return (payload[1] ?? []).filter((country) => country.id && country.id !== 'NA' && country.region?.id !== 'NA').map((country) => ({ code: country.id, name: country.name }))
    })
    .catch((error) => {
      // Drop the cached rejection so a later visit can retry instead of
      // being stuck with a permanently failed promise.
      countriesPromise = null
      throw error
    })
  return countriesPromise
}

interface WorldBankRow {
  date: string
  value: number | null
  countryiso3code?: string
}

function toPoints(rows: WorldBankRow[]): IndicatorPoint[] {
  return rows
    .map((row) => ({
      year: Number(row.date),
      value: row.value === null ? null : Number(row.value),
    }))
    .filter((point) => Number.isFinite(point.year))
    .sort((a, b) => a.year - b.year)
}

async function readSeries(url: string): Promise<WorldBankRow[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`World Bank API error: ${response.status}`)
  const payload = (await response.json()) as unknown
  if (!Array.isArray(payload) || payload.length < 2) {
    throw new Error('World Bank API returned an unexpected response')
  }
  return (payload[1] ?? []) as WorldBankRow[]
}

export async function fetchIndicatorFromApi(
  countryCode: string,
  indicatorCode: string,
  fromYear = FIRST_YEAR,
  toYear = lastYear(),
): Promise<IndicatorPoint[]> {
  const rows = await readSeries(
    `${API_BASE}/country/${countryCode}/indicator/${indicatorCode}?format=json&per_page=200&date=${fromYear}:${toYear}`,
  )
  return toPoints(rows)
}

// The API accepts several countries in one call, which turns a request per
// country into a single round trip. Long lists are asked for as "all" because
// a semicolon separated path would grow past a sensible URL length.
const SEMICOLON_LIMIT = 60

export async function fetchIndicatorForCountriesFromApi(
  countryCodes: string[],
  indicatorCode: string,
  fromYear = FIRST_YEAR,
  toYear = lastYear(),
): Promise<Record<string, IndicatorPoint[]>> {
  if (countryCodes.length === 0) return {}

  const useAll = countryCodes.length > SEMICOLON_LIMIT
  const path = useAll ? 'all' : countryCodes.join(';')
  const span = toYear - fromYear + 1
  const perPage = useAll ? 20000 : Math.max(200, countryCodes.length * span + 100)

  const rows = await readSeries(
    `${API_BASE}/country/${path}/indicator/${indicatorCode}?format=json&per_page=${perPage}&date=${fromYear}:${toYear}`,
  )

  const wanted = new Set(countryCodes)
  const grouped = new Map<string, WorldBankRow[]>()
  rows.forEach((row) => {
    const code = row.countryiso3code
    if (!code || !wanted.has(code)) return
    const bucket = grouped.get(code)
    if (bucket) bucket.push(row)
    else grouped.set(code, [row])
  })

  const out: Record<string, IndicatorPoint[]> = {}
  countryCodes.forEach((code) => {
    out[code] = toPoints(grouped.get(code) ?? [])
  })
  return out
}
