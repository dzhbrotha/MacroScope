import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import { useCountries } from '../../backend/CountriesProvider'
import { useI18n } from '../i18n'
import styles from './CountrySelect.module.css'

interface CountrySelectProps {
  label: string
  value: string
  onChange: (code: string) => void
}

// Searchable country picker. The full World Bank list runs to roughly two
// hundred entries, so a plain dropdown is no longer usable on its own.
export default function CountrySelect({ label, value, onChange }: CountrySelectProps) {
  const { countries, nameOf, matches } = useCountries()
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const visible = useMemo(
    () => countries.filter((country) => matches(country, query)).slice(0, 120),
    [countries, query, matches],
  )

  function pick(code: string) {
    onChange(code)
    setOpen(false)
    setQuery('')
  }

  return (
    <div className={styles.field} ref={wrapRef}>
      <span className={styles.label}>{label}</span>
      <button
        type="button"
        className={styles.control}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{nameOf(value)}</span>
        <ChevronDown size={15} strokeWidth={2} />
      </button>

      {open ? (
        <div className={styles.panel}>
          <div className={styles.searchRow}>
            <Search size={14} strokeWidth={2} className={styles.searchIcon} />
            <input
              ref={inputRef}
              className={styles.search}
              value={query}
              placeholder={t('common.search')}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className={styles.list} role="listbox">
            {visible.length === 0 ? (
              <p className={styles.empty}>{t('common.searchEmpty')}</p>
            ) : (
              visible.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  role="option"
                  aria-selected={country.code === value}
                  className={
                    country.code === value ? `${styles.option} ${styles.selected}` : styles.option
                  }
                  onClick={() => pick(country.code)}
                >
                  {country.name}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
