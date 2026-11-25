import { ar } from './ar'
import { fr, type Dict } from './fr'

export type { Dict }

export type Lang = 'fr' | 'ar'

/** The two language choices offered to the user. */
export const LANGS: { code: Lang; short: string; name: string }[] = [
  { code: 'fr', short: 'FR', name: 'Français' },
  { code: 'ar', short: 'عربي', name: 'العربية' },
]

export const DEFAULT_LANG: Lang = 'fr'

export const translations: Record<Lang, Dict> = { fr, ar }
