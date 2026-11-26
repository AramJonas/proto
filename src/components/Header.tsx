import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../i18n/langContext'
import { fold, formatDA } from '../lib/format'
import { HOME_HREF, productHref } from '../lib/useHashRoute'
import { useProducts } from '../store/productContext'
import { activeDiscountPrice } from '../store/productModel'
import { CloseIcon, MenuIcon, SearchIcon } from './Icons'
import LanguageSwitcher from './LanguageSwitcher'
import Logo from './Logo'

interface Props {
  query: string
  onQuery: (q: string) => void
  onOpenMenu: () => void
}

const MAX_RESULTS = 6

function SearchField({
  value,
  onChange,
  inputRef,
}: {
  value: string
  onChange: (v: string) => void
  inputRef?: React.Ref<HTMLInputElement>
}) {
  const { t, catalog } = useLang()
  const { products } = useProducts()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const q = fold(value.trim())
  const showDropdown = open && value.trim().length > 0

  const categoryName = (id: string) => catalog.categories.find((c) => c.id === id)?.name ?? id

  const results = useMemo(() => {
    if (!q) return []
    return products
      .filter(
        (p) =>
          fold(p.name).includes(q) ||
          fold(p.category).includes(q) ||
          fold(catalog.categories.find((c) => c.id === p.category)?.name ?? '').includes(q) ||
          fold(p.description).includes(q),
      )
      .slice(0, MAX_RESULTS)
  }, [q, products, catalog.categories])

  // Close when clicking / tapping outside the search wrapper.
  useEffect(() => {
    if (!showDropdown) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [showDropdown])

  const select = () => {
    setOpen(false)
    onChange('')
  }

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onKeyDown={(e) => {
        if (e.key === 'Escape') setOpen(false)
      }}
      onBlur={(e) => {
        // Keyboard tab-out only; pointer clicks outside are handled by the document listener
        // (relatedTarget is null in Safari when a link is clicked, so don't close on null).
        const next = e.relatedTarget as Node | null
        if (next && !e.currentTarget.contains(next)) setOpen(false)
      }}
    >
      <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-charcoal/50" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls="search-results"
        aria-autocomplete="list"
        autoComplete="off"
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

      {showDropdown && (
        <div
          id="search-results"
          dir="ltr"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-neutral-200 bg-white text-left shadow-xl"
        >
          {results.length === 0 ? (
            <p className="px-4 py-5 text-center text-sm font-bold text-[#252525]/70">
              Aucun produit trouvé
            </p>
          ) : (
            <ul role="listbox" className="max-h-[70vh] divide-y divide-neutral-100 overflow-y-auto">
              {results.map((p) => {
                const promo = activeDiscountPrice(p)
                return (
                  <li key={p.id} role="option" aria-selected={false}>
                    <a
                      href={productHref(p.id)}
                      onClick={select}
                      className="flex items-center gap-3 px-3 py-2.5 text-[#252525] transition-colors hover:bg-[#F36B0B]/10 focus-visible:bg-[#F36B0B]/10 focus-visible:outline-none"
                    >
                      {p.images[0] ? (
                        <img
                          src={p.images[0]}
                          alt=""
                          loading="lazy"
                          draggable={false}
                          className="size-12 shrink-0 rounded-lg bg-neutral-100 object-cover"
                        />
                      ) : (
                        <span aria-hidden className="size-12 shrink-0 rounded-lg bg-neutral-100" />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold">{p.name}</span>
                        <span className="block truncate text-xs text-[#252525]/60">
                          {categoryName(p.category)}
                        </span>
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-sm font-extrabold text-[#F36B0B]">
                        {formatDA(promo ?? p.price)}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
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
