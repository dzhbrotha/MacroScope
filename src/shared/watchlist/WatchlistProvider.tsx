import { createContext, useCallback, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'

// A short list of countries the reader cares about, pinned once and then
// available in every module. Terminals keep a watchlist for the same reason:
// most people follow a handful of markets and switch between them constantly.

export const WATCHLIST_MAX = 6
const STORAGE_KEY = 'macroscope.watchlist'
const DEFAULT_CODES = ['KAZ', 'USA', 'DEU']

interface WatchlistValue {
  codes: string[]
  has: (code: string) => boolean
  toggle: (code: string) => void
  remove: (code: string) => void
  full: boolean
}

const fallback: WatchlistValue = {
  codes: [],
  has: () => false,
  toggle: () => {},
  remove: () => {},
  full: false,
}

const WatchlistContext = createContext<WatchlistValue>(fallback)

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const [codes, setCodes] = usePersistentState<string[]>(STORAGE_KEY, DEFAULT_CODES)

  const toggle = useCallback(
    (code: string) => {
      if (!code) return
      setCodes((current) => {
        if (current.includes(code)) return current.filter((item) => item !== code)
        if (current.length >= WATCHLIST_MAX) return current
        return [...current, code]
      })
    },
    [setCodes],
  )

  const remove = useCallback(
    (code: string) => setCodes((current) => current.filter((item) => item !== code)),
    [setCodes],
  )

  const value = useMemo<WatchlistValue>(
    () => ({
      codes,
      has: (code: string) => codes.includes(code),
      toggle,
      remove,
      full: codes.length >= WATCHLIST_MAX,
    }),
    [codes, toggle, remove],
  )

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>
}

// The default value is a working no op, so a component that renders outside the
// app shell keeps working instead of throwing.
export function useWatchlist() {
  return useContext(WatchlistContext)
}
