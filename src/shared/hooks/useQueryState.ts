import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SetURLSearchParams } from 'react-router-dom'

// Keeps a module selection in the address bar so any view can be shared as a
// link, while still remembering the last choice locally when the link carries
// no parameters.

function readStored(key: string): string | null {
  try {
    return localStorage.getItem('macroscope.q.' + key)
  } catch {
    return null
  }
}

function writeStored(key: string, value: string) {
  try {
    localStorage.setItem('macroscope.q.' + key, value)
  } catch {
    // storage may be unavailable
  }
}

// A page can hold several of these hooks, and each one wants to seed the URL on
// mount. Writing them separately makes the last write win and drops the others,
// so seeds are collected and flushed together in a single navigation.
let pendingSeeds: Record<string, string> = {}
let flushScheduled = false

function queueSeed(key: string, value: string, setParams: SetURLSearchParams) {
  pendingSeeds[key] = value
  if (flushScheduled) return
  flushScheduled = true
  queueMicrotask(() => {
    const seeds = pendingSeeds
    pendingSeeds = {}
    flushScheduled = false
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        Object.entries(seeds).forEach(([seedKey, seedValue]) => {
          if (!next.has(seedKey)) next.set(seedKey, seedValue)
        })
        return next
      },
      { replace: true },
    )
  })
}

export function useQueryState(key: string, fallback: string) {
  const [params, setParams] = useSearchParams()
  const fromUrl = params.get(key)
  const value = fromUrl ?? readStored(key) ?? fallback

  useEffect(() => {
    if (fromUrl !== null) return
    queueSeed(key, value, setParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setValue = useCallback(
    (next: string) => {
      writeStored(key, next)
      setParams(
        (current) => {
          const updated = new URLSearchParams(current)
          updated.set(key, next)
          return updated
        },
        { replace: true },
      )
    },
    [key, setParams],
  )

  return [value, setValue] as const
}

export function useQueryStateList(key: string, fallback: string[]) {
  const [raw, setRaw] = useQueryState(key, fallback.join(','))
  const value = raw.split(',').map((item) => item.trim()).filter(Boolean)
  const setValue = useCallback((next: string[]) => setRaw(next.join(',')), [setRaw])
  return [value.length > 0 ? value : fallback, setValue] as const
}
