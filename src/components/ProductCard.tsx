import { useLang } from '../i18n/langContext'
import { isPromo } from '../lib/format'
import { productHref } from '../lib/useHashRoute'
import type { Product } from '../mockData'
import Glyph from './Glyph'
import { ShieldCheckIcon } from './Icons'
import PriceTag from './PriceTag'

/** Warranty pill — rendered only when the admin set a warranty on the product. */
export function WarrantyBadge({ warranty, className = '' }: { warranty?: string; className?: string }) {
  const { t } = useLang()
  if (!warranty) return null
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-charcoal/[0.06] px-2 py-0.5 text-xs font-bold text-charcoal ${className}`}
    >
      <ShieldCheckIcon className="size-3.5 text-primary" />
      {t.card.warranty(warranty)}
    </span>
  )
}

/** Frame for the product visual (SVG icon placeholder or real image). */
export function ProductVisual({
  product,
  className = '',
  iconClass = 'size-16',
  imageIndex = 0,
  eager = false,
}: {
  product: Product
  className?: string
  iconClass?: string
  /** Which photo of `product.images` to show (0 = cover). */
  imageIndex?: number
  /** Disable lazy-loading for above-the-fold images. */
  eager?: boolean
}) {
  const { t } = useLang()
  const image = product.images?.[imageIndex] ?? product.images?.[0]
  return (
    <div
      className={`relative grid place-items-center overflow-hidden bg-gray-50 ${className}`}
    >
      {image ? (
        <img
          src={image}
          alt={product.title}
          loading={eager ? 'eager' : 'lazy'}
          className="size-full object-cover"
        />
      ) : (
        <span role="img" aria-label={product.title} className="text-charcoal/30">
          <Glyph name={product.icon} className={iconClass} />
        </span>
      )}
      {isPromo(product) && product.inStock && (
        <span className="absolute start-2 top-2 rounded-full bg-primary/90 px-2 py-0.5 text-[11px] font-bold leading-4 text-white">
          {t.card.promo}
        </span>
      )}
      {!product.inStock && (
        <span className="absolute inset-0 grid place-items-center bg-white/60">
          <span className="rounded-full bg-charcoal px-3 py-1.5 text-xs font-extrabold text-white shadow-sm">
            {t.card.outOfStock}
          </span>
        </span>
      )}
    </div>
  )
}

export default function ProductCard({ product }: { product: Product }) {
  const { t } = useLang()
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white transition-all hover:border-gray-300 hover:shadow-sm">
      <a href={productHref(product.id)} className="block" tabIndex={-1} aria-hidden>
        <ProductVisual product={product} className="aspect-square" />
      </a>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-5 text-charcoal">
          <a href={productHref(product.id)} className="hover:text-primary">
            {product.title}
          </a>
        </h3>
        <WarrantyBadge warranty={product.warranty} className="self-start" />
        <div className="mt-auto flex flex-col gap-2.5 pt-1">
          <PriceTag price={product.price} oldPrice={product.oldPrice} />
          {product.inStock ? (
            <a
              href={productHref(product.id, true)}
              aria-label={t.card.orderAria(product.title)}
              className="grid h-10 place-items-center rounded-lg bg-primary text-sm font-bold text-white transition-colors hover:bg-primary/90 active:scale-[0.98]"
            >
              {t.card.order}
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="grid h-10 place-items-center rounded-lg bg-charcoal/10 text-sm font-bold text-charcoal/50"
            >
              {t.card.unavailable}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
