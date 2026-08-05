import { useEffect, useState } from 'react'

// A useState replacement that remembers its value in the browser between visits.
// Used so each module keeps the user's last selection instead of resetting.

export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? (JSON.parse(stored) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can fail in private mode or when the quota is full. Ignore it.
    }
  }, [key, value])

  return [value, setValue] as const
}
