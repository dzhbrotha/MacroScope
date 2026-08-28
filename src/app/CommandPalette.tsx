import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CornerDownLeft, Search, Star } from 'lucide-react'
import { useCountries } from '../backend/CountriesProvider'
import { countryTarget } from '../shared/lib/countryRoute'
import { rememberQueryState } from '../shared/hooks/useQueryState'
import { useWatchlist } from '../shared/watchlist'
import { useI18n } from '../shared/i18n'
import { navItems } from './navItems'
import styles from './CommandPalette.module.css'

// Any other part of the shell can open the palette without a shared context.
export const PALETTE_EVENT = 'macroscope:palette'

const COUNTRY_LIMIT = 7

interface Row {
  id: string
  kind: 'module' | 'country'
  label: string
  hint?: string
  run: () => void
}

export default function CommandPalette() {
  const { t } = useI18n()
  const { countries, matches } = useCountries()
  const { has, toggle } = useWatchlist()
  const navigate = useNavigate()
  const location = useLocation()

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const meta = event.metaKey || event.ctrlKey
      if (meta && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((current) => !current)
      }
    }
    function onRequest() {
      setOpen(true)
    }
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener(PALETTE_EVENT, onRequest)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener(PALETTE_EVENT, onRequest)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setCursor(0)
    const frame = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open])

  const modules = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return navItems
      .map((item) => ({ item, label: t(item.label) }))
      .filter(({ label }) => needle === '' || label.toLowerCase().includes(needle))
  }, [query, t])

  const picked = useMemo(() => {
    const needle = query.trim()
    if (needle === '') return []
    return countries.filter((country) => matches(country, needle)).slice(0, COUNTRY_LIMIT)
  }, [countries, matches, query])

  const rows = useMemo<Row[]>(() => {
    const moduleRows: Row[] = modules.map(({ item, label }) => ({
      id: `module:${item.to}`,
      kind: 'module',
      label,
      run: () => navigate(item.to),
    }))
    const countryRows: Row[] = picked.map((country) => ({
      id: `country:${country.code}`,
      kind: 'country',
      label: country.name,
      hint: country.code,
      run: () => {
        rememberQueryState('country', country.code)
        navigate(countryTarget(location.pathname, location.search, country.code))
      },
    }))
    return [...moduleRows, ...countryRows]
  }, [modules, picked, navigate, location.pathname, location.search])

  useEffect(() => {
    setCursor((current) => (current >= rows.length ? 0 : current))
  }, [rows.length])

  function choose(row: Row | undefined) {
    if (!row) return
    row.run()
    setOpen(false)
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setCursor((current) => (rows.length === 0 ? 0 : (current + 1) % rows.length))
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setCursor((current) => (rows.length === 0 ? 0 : (current - 1 + rows.length) % rows.length))
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      choose(rows[cursor])
      return
    }
    // Tab pins the highlighted country instead of leaving the field, so a
    // watchlist can be built without touching the mouse.
    if (event.key === 'Tab') {
      const row = rows[cursor]
      if (row?.kind === 'country' && row.hint) {
        event.preventDefault()
        toggle(row.hint)
      }
    }
  }

  useEffect(() => {
    if (!open) return
    const active = listRef.current?.querySelector('[data-active="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [cursor, open])

  if (!open) return null

  const moduleCount = modules.length

  return (
    <div className={styles.overlay} onMouseDown={() => setOpen(false)}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('cmd.placeholder')}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.searchRow}>
          <Search size={16} strokeWidth={2} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            placeholder={t('cmd.placeholder')}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
          />
          <kbd className={styles.kbd}>esc</kbd>
        </div>

        <div className={styles.list} ref={listRef}>
          {rows.length === 0 ? (
            <p className={styles.empty}>{t('cmd.empty')}</p>
          ) : (
            rows.map((row, index) => (
              <div key={row.id}>
                {index === 0 && row.kind === 'module' ? (
                  <p className={styles.group}>{t('cmd.modules')}</p>
                ) : null}
                {index === moduleCount && row.kind === 'country' ? (
                  <p className={styles.group}>{t('cmd.countries')}</p>
                ) : null}
                <button
                  type="button"
                  data-active={index === cursor}
                  className={index === cursor ? `${styles.row} ${styles.on}` : styles.row}
                  onMouseEnter={() => setCursor(index)}
                  onClick={() => choose(row)}
                >
                  <span className={styles.rowLabel}>{row.label}</span>
                  {row.kind === 'country' && row.hint ? (
                    <span className={styles.rowMeta}>
                      {has(row.hint) ? (
                        <Star size={12} strokeWidth={2} fill="currentColor" className={styles.pinned} />
                      ) : null}
                      <span className={styles.code}>{row.hint}</span>
                    </span>
                  ) : (
                    <CornerDownLeft size={13} strokeWidth={1.75} className={styles.enter} />
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        <footer className={styles.foot}>{t('cmd.hint')}</footer>
      </div>
    </div>
  )
}
