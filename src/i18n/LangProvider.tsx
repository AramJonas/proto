import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { useProducts } from '../store/productContext'
import { getCatalog } from './catalog'
import { LangContext, type LangContextValue } from './langContext'
import { DEFAULT_LANG, translations, type Lang } from './translations'

const STORAGE_KEY = 'moulinaxx:lang'

const isLang = (v: unknown): v is Lang => v === 'fr' || v === 'ar'

function readStoredLang(): Lang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (isLang(stored)) return stored
  } catch {
    /* storage unavailable (private mode, etc.) */
  }
  return DEFAULT_LANG
}

/** Holds the active language (French / Arabic), persists it, and keeps <html lang dir> in sync. */
export default function LangProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts()
  const [lang, setLangState] = useState<Lang>(readStoredLang)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  // The layout stays left-to-right in every language (Arabic text is still translated, but the
  // header, drawer and carousel are never mirrored).
  const dir: 'ltr' | 'rtl' = 'ltr'

  useLayoutEffect(() => {
    const root = document.documentElement
    root.lang = lang
    root.dir = dir
    document.title = translations[lang].meta.title
  }, [lang, dir])

  const value = useMemo<LangContextValue>(
    () => ({ lang, dir, setLang, t: translations[lang], catalog: getCatalog(lang, products) }),
    [lang, dir, setLang, products],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
