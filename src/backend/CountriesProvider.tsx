import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { COUNTRIES, COUNTRY_NAMES_RU } from './constants'
import type { Country } from './constants'
import { fetchWorldBankCountries } from './worldbank'
import { useI18n } from '../shared/i18n'

// Every module used to carry its own hardcoded list of 22 countries. This
// provider fetches the full World Bank list once and shares it, falling back
// to the curated list when the API is unreachable.

// Display name plus the alternate spelling, so a Russian reader can still find
// a country by typing its English name and the other way round.
export interface CountryOption extends Country {
  alt: string
}

interface CountriesValue {
  countries: CountryOption[]
  featured: CountryOption[]
  loading: boolean
  nameOf: (code: string) => string
  matches: (country: CountryOption, query: string) => boolean
}

const CountriesContext = createContext<CountriesValue | null>(null)

export function CountriesProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n()
  const [raw, setRaw] = useState<Country[]>(COUNTRIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchWorldBankCountries()
      .then((list) => {
        if (cancelled || list.length === 0) return
        setRaw(list)
      })
      .catch((error) => {
        console.warn('Falling back to the curated country list:', error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<CountriesValue>(() => {
    const localize = (country: Country): CountryOption => {
      const translated = COUNTRY_NAMES_RU[country.code]
      if (lang === 'ru' && translated) {
        return { code: country.code, name: translated, alt: country.name }
      }
      return { code: country.code, name: country.name, alt: translated ?? '' }
    }

    const countries = raw.map(localize).sort((a, b) => a.name.localeCompare(b.name))
    const featured = COUNTRIES.map(localize).sort((a, b) => a.name.localeCompare(b.name))
    const byCode = new Map(countries.map((country) => [country.code, country.name]))

    return {
      countries,
      featured,
      loading,
      nameOf: (code) => byCode.get(code) ?? COUNTRY_NAMES_RU[code] ?? code,
      matches: (country, query) => {
        const needle = query.trim().toLowerCase()
        if (!needle) return true
        return (
          country.name.toLowerCase().includes(needle) ||
          country.alt.toLowerCase().includes(needle) ||
          country.code.toLowerCase().includes(needle)
        )
      },
    }
  }, [raw, loading, lang])

  return <CountriesContext.Provider value={value}>{children}</CountriesContext.Provider>
}

export function useCountries(): CountriesValue {
  const ctx = useContext(CountriesContext)
  if (!ctx) throw new Error('useCountries must be used inside CountriesProvider')
  return ctx
}
