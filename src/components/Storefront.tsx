import { useMemo } from 'react'
import { useLang } from '../i18n/langContext'
import { fold, isPromo } from '../lib/format'
import type { IconName, Product } from '../mockData'
import Glyph from './Glyph'
import HeroCarousel from './HeroCarousel'
import { SearchIcon } from './Icons'
import ProductCard from './ProductCard'
import { CategoryPills, TrustStrip } from './Sections'
import type { CategoryFilter } from './MenuDrawer'

interface Props {
  filter: CategoryFilter
  onFilter: (f: CategoryFilter) => void
  query: string
}

function Grid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}

function SectionTitle({
  id,
  children,
  count,
  icon,
}: {
  id: string
  children: string
  count: number
  icon?: IconName
}) {
  const { t } = useLang()
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 id={id} className="flex items-center gap-2 text-lg font-extrabold text-charcoal sm:text-xl">
        {icon && <Glyph name={icon} className="size-5 shrink-0 self-center text-primary sm:size-6" />}
        {children}
      </h2>
      <span className="text-xs font-semibold text-charcoal/50">{t.storefront.count(count)}</span>
    </div>
  )
}

export default function Storefront({ filter, onFilter, query }: Props) {
  const { t, catalog } = useLang()
  const { categories, products } = catalog
  const q = fold(query.trim())

  const visible = useMemo(
    () =>
      products.filter((p) => {
        if (filter === 'promo' && !isPromo(p)) return false
        if (filter !== 'all' && filter !== 'promo' && p.categoryId !== filter) return false
        if (q && !fold(p.title + ' ' + p.description).includes(q)) return false
        return true
      }),
    [products, filter, q],
  )

  // "All" view (no search) → one section per category; otherwise a single flat grid.
  const grouped = filter === 'all' && !q
  const flatTitle = q
    ? t.storefront.resultsFor(query.trim())
    : filter === 'promo'
      ? t.storefront.promotions
      : (categories.find((c) => c.id === filter)?.name ?? t.storefront.products)

  return (
    <>
      <HeroCarousel />
      <TrustStrip />
      <CategoryPills active={filter} onSelect={onFilter} />

      <div className="mt-4 bg-gray-50/70 pb-8">
      <div id="products" className="page-container scroll-mt-20 space-y-8 pt-5 lg:space-y-10 lg:pt-6">
        {visible.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center ring-1 ring-black/5">
            <SearchIcon className="mx-auto size-10 text-charcoal/40" />
            <p className="mt-3 font-bold text-charcoal">{t.storefront.noResult}</p>
            <button
              type="button"
              onClick={() => onFilter('all')}
              className="mt-4 h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white"
            >
              {t.storefront.seeAll}
            </button>
          </div>
        ) : grouped ? (
          categories.map((c) => {
            const items = visible.filter((p) => p.categoryId === c.id)
            if (!items.length) return null
            return (
              <section key={c.id} aria-labelledby={`cat-${c.id}`}>
                <SectionTitle id={`cat-${c.id}`} count={items.length} icon={c.icon}>
                  {c.name}
                </SectionTitle>
                <Grid items={items} />
              </section>
            )
          })
        ) : (
          <section aria-labelledby="flat-title">
            <SectionTitle id="flat-title" count={visible.length}>
              {flatTitle}
            </SectionTitle>
            <Grid items={visible} />
          </section>
        )}
      </div>
      </div>
    </>
  )
}
