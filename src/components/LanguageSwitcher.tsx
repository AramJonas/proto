import { useLang } from '../i18n/langContext'
import { LANGS } from '../i18n/translations'

/** Two-choice language toggle: Français | العربية. */
export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLang()
  return (
    <div
      role="group"
      aria-label={t.lang.label}
      className="flex shrink-0 items-center rounded-full bg-paper p-0.5 text-xs font-extrabold"
    >
      {LANGS.map((l) => {
        const active = lang === l.code
        return (
          <button
            key={l.code}
            type="button"
            lang={l.code}
            title={l.name}
            aria-label={l.name}
            aria-pressed={active}
            onClick={() => setLang(l.code)}
            className={`h-9 min-w-10 rounded-full px-2.5 transition-colors ${
              active ? 'bg-primary text-white shadow-sm' : 'text-charcoal hover:bg-white'
            }`}
          >
            {l.short}
          </button>
        )
      })}
    </div>
  )
}
