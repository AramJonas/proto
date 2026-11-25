import { useEffect, useState } from 'react'
import { useLang } from '../i18n/langContext'
import type { Product } from '../mockData'
import { HOME_HREF } from '../lib/useHashRoute'
import { ChevronLeftIcon, CheckIcon, PackageIcon, SearchIcon } from './Icons'
import OrderForm from './OrderForm'
import PriceTag from './PriceTag'
import ProductCard, { ProductVisual, WarrantyBadge } from './ProductCard'

interface Props {
  product: Product | undefined
  scrollToOrder: boolean
  onToast: (message: string) => void
}

/** Main photo + clickable thumbnails (thumbnails only when the product has several photos). */
function Gallery({ product }: { product: Product }) {
  const [index, setIndex] = useState(0)
  const images = product.images ?? []
  return (
    <div className="space-y-2">
      <ProductVisual
        product={product}
        imageIndex={index}
        eager
        className="aspect-square rounded-xl sm:aspect-[4/3] md:aspect-square"
        iconClass="size-28"
      />
      {images.length > 1 && (
        <ul
          className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,5rem))] gap-2"
          aria-label={product.title}
        >
          {images.map((src, i) => (
            <li key={`${i}-${src.slice(-24)}`} className="min-w-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`${product.title} — ${i + 1}/${images.length}`}
                aria-current={i === index ? 'true' : undefined}
                className={`block aspect-square w-full overflow-hidden rounded-lg bg-paper ring-2 transition-shadow ${
                  i === index ? 'ring-primary' : 'ring-transparent hover:ring-primary/40'
                }`}
              >
                <img src={src} alt="" loading="lazy" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ProductPage({ product, scrollToOrder, onToast }: Props) {
  const { t, catalog } = useLang()
  const { categories, products } = catalog
  const id = product?.id
  useEffect(() => {
    if (scrollToOrder && id) {
      // wait a frame so the form is laid out
      requestAnimationFrame(() =>
        document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [id, scrollToOrder])

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <SearchIcon className="mx-auto size-12 text-charcoal/40" />
        <h1 className="mt-4 text-xl font-extrabold">{t.productPage.notFound}</h1>
        <a
          href={HOME_HREF}
          className="mt-6 inline-grid h-12 place-items-center rounded-xl bg-primary px-6 font-bold text-white"
        >
          {t.productPage.back}
        </a>
      </div>
    )
  }

  const category = categories.find((c) => c.id === product.categoryId)
  const related = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="page-container pb-10 pt-3 lg:pt-5">
      <a
        href={HOME_HREF}
        className="mb-3 inline-flex h-10 items-center gap-1 rounded-full pr-3 text-sm font-bold text-charcoal hover:text-primary"
      >
        <ChevronLeftIcon className="size-5 rtl:-scale-x-100" />
        {t.productPage.back}
      </a>

      {/* One unified section (no outer frame): product details + order form */}
      <div className="grid md:grid-cols-2">
        {/* Detail */}
        <section className="p-3 sm:p-4 md:p-6">
          <div className="md:sticky md:top-20">
          <Gallery key={product.id} product={product} />
          <div className="space-y-3 px-1 pb-1 pt-4">
            {category && (
              <p className="text-xs font-bold uppercase tracking-wider text-charcoal/50">
                {category.name}
              </p>
            )}
            <h1 className="text-xl font-extrabold leading-snug text-charcoal sm:text-2xl">
              {product.title}
            </h1>
            <PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" />
            <div className="flex flex-wrap items-center gap-2 empty:hidden">
              <WarrantyBadge warranty={product.warranty} className="py-1 text-sm" />
              {!product.inStock && (
                <span className="rounded-full bg-charcoal px-3 py-1 text-sm font-bold text-white">
                  {t.card.outOfStock}
                </span>
              )}
            </div>
            <p className="whitespace-pre-line text-sm leading-6 text-charcoal/75">
              {product.description}
            </p>
            <ul className="space-y-1.5">
              {product.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-semibold text-charcoal">
                  <CheckIcon className="size-4 shrink-0 text-primary" strokeWidth={3} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          </div>
        </section>

        {/* Order form — divider: horizontal on mobile, vertical on md+. Keyed so it fully resets for another product */}
        <div className="border-t border-neutral-100 md:border-s md:border-t-0">
          {product.inStock ? (
            <OrderForm key={product.id} product={product} onToast={onToast} />
          ) : (
            <div id="order" className="scroll-mt-20 p-6 text-center">
              <PackageIcon className="mx-auto size-10 text-charcoal/40" />
              <p className="mt-2 text-lg font-extrabold text-charcoal">{t.card.outOfStock}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10" aria-labelledby="related-title">
          <h2 id="related-title" className="mb-3 text-lg font-extrabold text-charcoal">
            {t.productPage.related}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
