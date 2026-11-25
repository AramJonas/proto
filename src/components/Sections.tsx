import { MapPin } from 'lucide-react'
import { useLang } from '../i18n/langContext'
import { type IconName, type TrustIcon } from '../mockData'
import Glyph from './Glyph'
import {
  CashIcon,
  ChatIcon,
  FacebookIcon,
  InstagramIcon,
  PhoneIcon,
  RefreshIcon,
  TikTokIcon,
  TruckIcon,
} from './Icons'
import Logo from './Logo'
import type { CategoryFilter } from './MenuDrawer'

export function AnnouncementBar() {
  const { catalog } = useLang()
  return (
    <div className="flex items-center justify-center gap-2 bg-charcoal px-3 py-2 text-center text-xs font-semibold text-white sm:text-sm">
      <TruckIcon className="size-4 shrink-0 text-primary" />
      <span>{catalog.store.announcement}</span>
    </div>
  )
}

const trustIcons: Record<TrustIcon, typeof TruckIcon> = {
  truck: TruckIcon,
  cash: CashIcon,
  refresh: RefreshIcon,
  chat: ChatIcon,
}

/** Slim single-line trust strip: icon + title only. Swipeable on narrow screens, evenly spread on desktop. */
export function TrustStrip() {
  const { t, catalog } = useLang()
  return (
    <section aria-label={t.sections.trustAria} className="page-container pt-3 lg:pt-5">
      <ul className="no-scrollbar -mx-3 flex gap-5 overflow-x-auto rounded-none bg-white px-4 py-2.5 ring-1 ring-black/5 sm:mx-0 sm:justify-between sm:rounded-xl sm:px-5 lg:px-8">
        {catalog.trustItems.map((item) => {
          const Icon = trustIcons[item.icon]
          return (
            <li key={item.icon} className="flex shrink-0 items-center gap-2 text-[13px] font-bold text-charcoal">
              <Icon className="size-[18px] shrink-0 text-primary" />
              <span className="whitespace-nowrap">{item.title}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Horizontally swipeable category pills; the active pill is orange. */
export function CategoryPills({
  active,
  onSelect,
}: {
  active: CategoryFilter
  onSelect: (f: CategoryFilter) => void
}) {
  const { t, catalog } = useLang()
  const pills: { id: CategoryFilter; label: string; icon: IconName }[] = [
    { id: 'all', label: t.sections.pillAll, icon: 'shopping-bag' },
    { id: 'promo', label: t.sections.pillPromos, icon: 'flame' },
    ...catalog.categories.map((c) => ({ id: c.id, label: c.name, icon: c.icon })),
  ]
  return (
    <nav aria-label={t.sections.categoriesAria} className="page-container pt-4 lg:pt-6">
      {/* Mobile/tablet: swipeable row bleeding to the screen edge. Desktop: wraps, aligned with the grid. */}
      <ul className="no-scrollbar -mx-3 flex snap-x snap-proximity items-center gap-2 overflow-x-auto overflow-y-visible px-3 py-2 sm:-mx-5 sm:px-5 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
        {pills.map((p) => {
          const isActive = active === p.id
          return (
            <li key={p.id} className="flex shrink-0 snap-start items-center">
              <button
                type="button"
                onClick={() => onSelect(p.id)}
                aria-pressed={isActive}
                className={`flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-white text-charcoal ring-1 ring-black/10 hover:ring-primary'
                }`}
              >
                <Glyph name={p.icon} className="size-[18px] shrink-0" />
                {p.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Dark charcoal storefront footer: brand, contact and social links. Stacked on mobile, 3 columns from `sm`. */
/** Google Maps link to the physical store in Batna. */
const STORE_MAPS_URL = 'https://maps.app.goo.gl/G4ykoTJQceBesHJu7'

export function Footer() {
  const { t, catalog } = useLang()
  const { store } = catalog
  const socials = [
    { label: 'Instagram', url: store.social.instagram, Icon: InstagramIcon },
    { label: 'Facebook', url: store.social.facebook, Icon: FacebookIcon },
    { label: 'TikTok', url: store.social.tiktok, Icon: TikTokIcon },
  ]
  return (
    <footer className="mt-12 bg-charcoal pb-24 pt-10 text-white">
      <div className="page-container grid gap-8 sm:grid-cols-3">
        <div>
          <span className="inline-block rounded-xl bg-white px-3 py-2">
            <Logo className="h-8" alt={store.name} />
          </span>
          <p className="mt-2 text-sm text-white/70">{store.tagline}</p>
        </div>

        <div className="text-sm text-white/80">
          <p className="mb-2 font-bold text-white">{t.footer.contact}</p>
          <a
            href={`tel:${store.phoneTel}`}
            className="flex min-h-11 items-center gap-2 font-semibold text-white hover:text-primary"
          >
            <PhoneIcon className="size-4 text-primary" />
            <span dir="ltr">{store.phoneDisplay}</span>
          </a>
          <p>{store.email}</p>
          <p>{store.address}</p>
          <a
            href={STORE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center gap-3 rounded-xl bg-white/10 p-3 transition-colors hover:bg-primary"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-white">
              <MapPin aria-hidden className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block font-bold text-white">{t.footer.storeTitle}</span>
              <span className="block text-white/80">
                {t.footer.storeMap}
                <span className="sr-only"> {t.footer.storeNewTab}</span>
              </span>
            </span>
          </a>
        </div>

        <div className="text-sm text-white/80">
          <p className="mb-2 font-bold text-white">{t.footer.followUs}</p>
          <ul className="flex flex-wrap gap-2">
            {socials.map(({ label, url, Icon }) => (
              <li key={label}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center gap-2 rounded-full bg-white/10 px-4 font-semibold text-white transition-colors hover:bg-primary"
                >
                  <Icon className="size-5" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="page-container">
        <p className="mt-8 border-t border-white/10 pt-4 text-xs text-white/50">
          {t.footer.prototype(new Date().getFullYear(), store.name)}
        </p>
      </div>
    </footer>
  )
}
