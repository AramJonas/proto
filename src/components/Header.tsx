import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n/langContext'
import { HOME_HREF } from '../lib/useHashRoute'
import { CloseIcon, MenuIcon, SearchIcon } from './Icons'
import LanguageSwitcher from './LanguageSwitcher'
import Logo from './Logo'

interface Props {
  query: string
  onQuery: (q: string) => void
  onOpenMenu: () => void
}

function SearchField({
  value,
  onChange,
  inputRef,
}: {
  value: string
  onChange: (v: string) => void
  inputRef?: React.Ref<HTMLInputElement>
}) {
  const { t } = useLang()
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-charcoal/50" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.header.searchPlaceholder}
        aria-label={t.header.searchLabel}
        enterKeyHint="search"
        className="h-11 w-full rounded-full border border-transparent bg-paper ps-11 pe-10 text-base text-charcoal placeholder:text-charcoal/50 focus:border-primary focus:bg-white focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t.header.clearSearch}
          className="absolute end-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-charcoal/60 hover:bg-black/5"
        >
          <CloseIcon className="size-4" />
        </button>
      )}
    </div>
  )
}

/** Sticky white top bar: Menu · wordmark · search · language. No account, no cart. */
export default function Header({ query, onQuery, onOpenMenu }: Props) {
  const { t, catalog } = useLang()
  const { store } = catalog
  const [searchOpen, setSearchOpen] = useState(false)
  const mobileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchOpen) mobileInput.current?.focus()
  }, [searchOpen])

  const showMobileSearch = searchOpen || query.length > 0

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white">
      <div className="page-container flex h-16 items-center gap-2 lg:h-[72px]">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label={t.header.openMenu}
          aria-controls="site-menu"
          className="-ms-1 grid size-11 shrink-0 place-items-center rounded-full text-charcoal hover:bg-paper"
        >
          <MenuIcon className="size-6" />
        </button>

        <a href={HOME_HREF} aria-label={t.header.home(store.name)} className="shrink-0">
          <Logo className="h-7 sm:h-9 lg:h-10" />
        </a>

        {/* Desktop: inline search */}
        <div className="mx-auto hidden w-full max-w-md md:block lg:max-w-xl xl:max-w-2xl">
          <SearchField value={query} onChange={onQuery} />
        </div>

        {/* Language choice: Français | العربية */}
        <div className="ms-auto md:ms-0">
          <LanguageSwitcher />
        </div>

        {/* Mobile: search trigger */}
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          aria-label={t.header.search}
          aria-expanded={showMobileSearch}
          className={`grid size-11 shrink-0 place-items-center rounded-full md:hidden ${
            showMobileSearch ? 'bg-primary text-white' : 'text-charcoal hover:bg-paper'
          }`}
        >
          <SearchIcon className="size-6" />
        </button>
      </div>

      {showMobileSearch && (
        <div className="border-t border-black/5 px-3 pb-3 pt-2 sm:px-5 md:hidden">
          <SearchField value={query} onChange={onQuery} inputRef={mobileInput} />
        </div>
      )}
    </header>
  )
}
