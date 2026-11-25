import { useEffect } from 'react'
import { useLang } from '../i18n/langContext'
import { isPromo } from '../lib/format'
import type { IconName } from '../mockData'
import Glyph from './Glyph'
import { CloseIcon, HomeIcon, PhoneIcon } from './Icons'

export type CategoryFilter = 'all' | 'promo' | string

interface Props {
  open: boolean
  onClose: () => void
  active: CategoryFilter
  onSelect: (filter: CategoryFilter) => void
}

/** White slide-out category menu (opens from the start edge: left in French, right in Arabic). */
export default function MenuDrawer({ open, onClose, active, onSelect }: Props) {
  const { t, catalog } = useLang()
  const { categories, products, store } = catalog

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const promoCount = products.filter(isPromo).length

  const item = (id: CategoryFilter, label: string, count: number, icon: IconName) => {
    const isActive = active === id
    return (
      <li key={id}>
        <button
          type="button"
          onClick={() => onSelect(id)}
          aria-current={isActive ? 'true' : undefined}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-start text-[15px] font-semibold transition-colors ${
            isActive ? 'bg-primary text-white' : 'text-charcoal hover:bg-paper'
          }`}
        >
          <Glyph name={icon} className="size-5 shrink-0" />
          <span className="flex-1">{label}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              isActive ? 'bg-white/25 text-white' : 'bg-paper text-charcoal/60'
            }`}
          >
            {count}
          </span>
        </button>
      </li>
    )
  }

  return (
    <div className={`fixed inset-0 z-[70] ${open ? '' : 'pointer-events-none'}`} inert={!open}>
      <div
        onClick={onClose}
        aria-hidden
        className={`absolute inset-0 bg-charcoal/60 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t.menu.title}
        className={`absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-black/5 px-4">
          <span className="text-lg font-extrabold text-charcoal">{t.menu.title}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.menu.close}
            className="grid size-10 place-items-center rounded-full text-charcoal hover:bg-paper"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <nav aria-label={t.menu.categoriesAria} className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {item('all', t.menu.all, products.length, 'shopping-bag')}
            {item('promo', t.menu.promos, promoCount, 'flame')}
          </ul>
          <p className="px-3 pb-2 pt-5 text-xs font-bold uppercase tracking-wider text-charcoal/50">
            {t.menu.categories}
          </p>
          <ul className="space-y-1">
            {categories.map((c) =>
              item(c.id, c.name, products.filter((p) => p.categoryId === c.id).length, c.icon),
            )}
          </ul>
        </nav>

        <div className="shrink-0 space-y-2 border-t border-black/5 bg-paper p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-charcoal">
            <HomeIcon className="size-4 text-primary" />
            {store.address}
          </p>
          <a
            href={`tel:${store.phoneTel}`}
            className="flex items-center gap-2 font-bold text-charcoal"
          >
            <PhoneIcon className="size-4 text-primary" />
            <span dir="ltr">{store.phoneDisplay}</span>
          </a>
        </div>
      </aside>
    </div>
  )
}
