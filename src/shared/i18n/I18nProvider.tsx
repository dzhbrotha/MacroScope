import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DICTS } from './dict'
import type { Language, TranslationKey } from './dict'

const STORAGE_KEY = 'macroscope.lang'

type Params = Record<string, string | number>

interface I18nValue {
  lang: Language
  setLang: (next: Language) => void
  t: (key: TranslationKey, params?: Params) => string
}

const I18nContext = createContext<I18nValue | null>(null)

function readInitialLang(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ru' || stored === 'en') return stored
  } catch {
    // storage may be unavailable in private mode
  }
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(readInitialLang)

  const setLang = useCallback((next: Language) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore storage failures
    }
    document.documentElement.lang = next
  }, [])

  const t = useCallback(
    (key: TranslationKey, params?: Params) => {
      const template = DICTS[lang][key] ?? DICTS.en[key] ?? key
      if (!params) return template
      return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
      )
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
