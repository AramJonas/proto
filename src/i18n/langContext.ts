import { createContext, useContext } from 'react'
import type { Catalog } from './catalog'
import type { Dict, Lang } from './translations'

export interface LangContextValue {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (lang: Lang) => void
  /** UI strings in the active language. */
  t: Dict
  /** Store / products / categories / wilayas in the active language. */
  catalog: Catalog
}

export const LangContext = createContext<LangContextValue | null>(null)

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}
