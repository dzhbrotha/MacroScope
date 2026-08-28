// Where a country jump should land.
//
// The modules do not agree on one parameter: most read a single `country`, the
// unemployment comparison reads a `countries` list, and a couple do not take a
// country at all. Every shortcut that switches country goes through here so all
// of them behave the same way.

const SINGLE = [
  '/app',
  '/app/board',
  '/app/country',
  '/app/inflation',
  '/app/quality-of-life',
  '/app/sanctions',
]
const LIST = '/app/unemployment'
const LIST_MAX = 5

export interface CountryTarget {
  pathname: string
  search: string
}

export function countryTarget(pathname: string, search: string, code: string): CountryTarget {
  const path = pathname.replace(/\/$/, '') || '/app'
  const params = new URLSearchParams(search)

  if (path === LIST) {
    const current = (params.get('countries') ?? '').split(',').filter(Boolean)
    const next = current.includes(code) ? current : [...current, code].slice(-LIST_MAX)
    params.set('countries', next.join(','))
    return { pathname: path, search: params.toString() }
  }

  if (SINGLE.includes(path)) {
    params.set('country', code)
    return { pathname: path, search: params.toString() }
  }

  // Anything else, such as the property lab, has no country of its own, so the
  // board takes over: it is the one view that fits any country.
  return { pathname: '/app/board', search: `country=${code}` }
}
