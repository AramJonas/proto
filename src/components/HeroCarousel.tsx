import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { useLang } from '../i18n/langContext'
import type { Lang } from '../i18n/translations'
import type { Product } from '../mockData'
import { productHref } from '../lib/useHashRoute'
import { useProducts } from '../store/productContext'
import { discountPct } from '../store/productModel'
import Glyph from './Glyph'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons'

/** Time each slide stays on screen (ms). */
const AUTOPLAY_MS = 6000

/** How many products are shown when the admin has not ticked any "Hero / Slideshow" box. */
const FALLBACK_COUNT = 3

type Localized<T = string> = { fr: T; ar: T }

/** Accessibility labels and texts for the carousel (fr / ar). */
const LABELS: Localized<{
  region: string
  prev: string
  next: string
  dots: string
  cta: string
  slide: (i: number, n: number) => string
  goTo: (i: number, n: number) => string
  oldPrice: string
  newPrice: string
  discount: (pct: number) => string
}> = {
  fr: {
    region: 'Produits à la une',
    prev: 'Diapositive précédente',
    next: 'Diapositive suivante',
    dots: 'Choisir une diapositive',
    cta: "Voir l'offre",
    slide: (i, n) => `Diapositive ${i} sur ${n}`,
    goTo: (i, n) => `Aller à la diapositive ${i} sur ${n}`,
    oldPrice: 'Ancien prix : ',
    newPrice: 'Nouveau prix : ',
    discount: (pct) => `${pct} % de réduction`,
  },
  ar: {
    region: 'منتجات مميزة',
    prev: 'الشريحة السابقة',
    next: 'الشريحة التالية',
    dots: 'اختر شريحة',
    cta: 'شاهد العرض',
    slide: (i, n) => `الشريحة ${i} من ${n}`,
    goTo: (i, n) => `الانتقال إلى الشريحة ${i} من ${n}`,
    oldPrice: 'السعر القديم : ',
    newPrice: 'السعر الجديد : ',
    discount: (pct) => `تخفيض ${pct}%`,
  },
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'
const subscribeReducedMotion = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED_MOTION)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
const usePrefersReducedMotion = () =>
  useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )

/** 16500 → "16 500 DA" (fr) / "16 500 د.ج" (ar), isolated LTR so Arabic never reorders the digits. */
function money(amount: number, lang: Lang): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
  return `\u2066${grouped}\u00A0${lang === 'ar' ? 'د.ج' : 'DA'}\u2069`
}

const SWIPE_MIN_PX = 50
const BUTTON_CLS =
  'mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F36B0B] px-6 py-2.5 text-sm font-extrabold lg:py-3 text-white transition-colors hover:bg-[#F36B0B]/90 active:scale-[0.98] sm:w-auto sm:self-start'
const NAV_BTN_CLS =
  'grid size-11 place-items-center rounded-full bg-[#252525]/10 text-[#252525] transition-colors hover:bg-[#F36B0B] hover:text-white'

export default function HeroCarousel() {
  const { lang, dir, catalog } = useLang()
  const { products: storeProducts } = useProducts()
  const L = LABELS[lang]
  const reduced = usePrefersReducedMotion()

  // Products ticked "Afficher dans le Hero / Slideshow" in /admin (store order); if none are
  // ticked, fall back to the first available products so the banner is never empty.
  const slides = useMemo<Product[]>(() => {
    const byId = new Map(catalog.products.map((p) => [p.id, p]))
    const featured = storeProducts
      .filter((p) => p.isFeaturedHero)
      .map((p) => byId.get(p.id))
      .filter((p): p is Product => p !== undefined)
    if (featured.length > 0) return featured
    const available = catalog.products.filter((p) => p.inStock)
    return (available.length > 0 ? available : catalog.products).slice(0, FALLBACK_COUNT)
  }, [storeProducts, catalog.products])
  const count = slides.length

  const [rawIndex, setIndex] = useState(0)
  // The slide list can shrink while the admin edits products: never point past the last slide.
  const index = Math.max(0, Math.min(rawIndex, count - 1))
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [touching, setTouching] = useState(false)
  const [dragX, setDragX] = useState(0)
  const drag = useRef<{ x: number; y: number; horizontal: boolean | null } | null>(null)

  const paused = hovered || focused || touching
  const go = (i: number) => setIndex(((i % count) + count) % count)

  // Autoplay: a fresh timer after every slide change, so manual navigation restarts the 6 s.
  useEffect(() => {
    if (paused || reduced || count < 2) return
    const id = window.setTimeout(
      () => setIndex((i) => (Math.min(i, count - 1) + 1) % count),
      AUTOPLAY_MS,
    )
    return () => window.clearTimeout(id)
  }, [index, paused, reduced, count])

  if (count === 0) return null

  // Arrow keys follow the visual direction: "next" is on the right in LTR and on the left in RTL.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const rtl = dir === 'rtl'
    let target: number | null = null
    if (e.key === 'ArrowRight') target = index + (rtl ? -1 : 1)
    else if (e.key === 'ArrowLeft') target = index + (rtl ? 1 : -1)
    else if (e.key === 'Home') target = 0
    else if (e.key === 'End') target = count - 1
    if (target === null) return
    e.preventDefault()
    go(target)
  }

  // Swipe (touch / pen). The viewport has `touch-action: pan-y`, so the browser keeps handling
  // vertical scrolling itself and only horizontal gestures are followed here.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') return
    setTouching(true)
    drag.current = { x: e.clientX, y: e.clientY, horizontal: null }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (d.horizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      d.horizontal = Math.abs(dx) > Math.abs(dy)
    }
    if (d.horizontal) setDragX(dx)
  }
  const endDrag = (e: React.PointerEvent, commit: boolean) => {
    const d = drag.current
    drag.current = null
    setTouching(false)
    setDragX(0)
    if (!d || !commit || !d.horizontal) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) < SWIPE_MIN_PX) return
    // Dragging toward the start edge (left in LTR, right in RTL) reveals the next slide.
    const towardNext = dir === 'rtl' ? dx > 0 : dx < 0
    go(index + (towardNext ? 1 : -1))
  }

  const sign = dir === 'rtl' ? 1 : -1
  const trackStyle: React.CSSProperties = {
    transform: `translateX(calc(${sign * index * 100}% + ${dragX}px))`,
    transition: dragX !== 0 || reduced ? 'none' : undefined,
  }

  // Dots + arrows, rendered inside the frosted info panel of every slide.
  const controls =
    count > 1 ? (
      <div className="mt-1 flex items-center justify-between gap-3">
        <div role="group" aria-label={L.dots} className="flex items-center">
          {slides.map((product, i) => (
            <button
              key={product.id}
              type="button"
              onClick={() => go(i)}
              aria-label={L.goTo(i + 1, count)}
              aria-current={i === index ? 'true' : undefined}
              className="grid h-11 w-6 place-items-center"
            >
              <span
                className={`block h-2 rounded-full transition-all ${
                  i === index ? 'w-6 bg-[#F36B0B]' : 'w-2 bg-[#252525]/30 hover:bg-[#252525]/60'
                }`}
              />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={L.prev}
            className={NAV_BTN_CLS}
          >
            <ChevronLeftIcon className="size-5 rtl:-scale-x-100" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={L.next}
            className={NAV_BTN_CLS}
          >
            <ChevronRightIcon className="size-5 rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    ) : null

  return (
    <section
      aria-roledescription="carousel"
      aria-label={L.region}
      className="w-full"
      onKeyDown={onKeyDown}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
    >
      <h1 className="sr-only">
        {catalog.store.name} — {catalog.store.tagline}
      </h1>

      <div className="relative w-full overflow-hidden bg-[#EFEFEF] text-[#252525]">
        <div
          className="touch-pan-y overflow-hidden"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, true)}
          onPointerCancel={(e) => endDrag(e, false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out"
            style={trackStyle}
            aria-live={paused || reduced ? 'polite' : 'off'}
          >
            {slides.map((product, i) => (
              <div
                key={product.id}
                role="group"
                aria-roledescription="slide"
                aria-label={L.slide(i + 1, count)}
                inert={i !== index}
                className="flex w-full shrink-0"
              >
                <SlideView
                  product={product}
                  categoryName={
                    catalog.categories.find((c) => c.id === product.categoryId)?.name ??
                    product.categoryId
                  }
                  lang={lang}
                  first={i === 0}
                  controls={controls}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** One featured product: full-bleed diagonal photo collage with a frosted info panel on top. */
function SlideView({
  product,
  categoryName,
  lang,
  first,
  controls,
}: {
  product: Product
  categoryName: string
  lang: Lang
  first: boolean
  controls?: React.ReactNode
}) {
  const L = LABELS[lang]
  // `oldPrice` is only set while a promotion is active (hasDiscount with a valid promo price).
  const oldPrice = product.oldPrice
  const pct = oldPrice !== undefined ? discountPct(oldPrice, product.price) : 0

  // If the second photo fails to load, the first one fills the whole area.
  const [secondaryFailed, setSecondaryFailed] = useState(false)
  const primarySrc = product.images?.[0]
  const secondarySrc = secondaryFailed ? undefined : product.images?.[1]

  return (
    <div className="relative flex min-w-0 flex-1 flex-col lg:min-h-[520px] lg:justify-center">
      {/* Full-bleed collage (background layer): stacked above the card on mobile, behind it on lg+. */}
      <div className="relative aspect-[3/2] overflow-hidden bg-[#EFEFEF] sm:aspect-auto sm:h-[440px] lg:absolute lg:inset-0 lg:h-auto">
        {primarySrc ? (
          <>
            {/* Image 1: ~62% wide box on the start side (full width when there is no 2nd photo), focal point to the right. */}
            <div
              className={`absolute inset-y-0 left-0 overflow-hidden ${
                secondarySrc ? 'w-[62%]' : 'w-full'
              }`}
            >
              <img
                src={primarySrc}
                alt={product.title}
                loading={first ? 'eager' : 'lazy'}
                fetchPriority={first ? 'high' : undefined}
                draggable={false}
                className="size-full object-cover object-right"
              />
            </div>
            {secondarySrc && (
              <>
                {/* Diagonal divider: a white strip, slightly wider than the image-2 cut. */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-white"
                  style={{
                    clipPath:
                      'polygon(calc(61% - 4px) 0, 100% 0, 100% 100%, calc(39% - 4px) 100%)',
                  }}
                />
                {/* Image 2: ~62% wide box on the end side, overlapping image 1 in the centre; the diagonal cut sits inside the overlap. */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: 'polygon(61% 0, 100% 0, 100% 100%, 39% 100%)' }}
                >
                  <div className="absolute inset-y-0 right-0 w-[62%] overflow-hidden">
                    <img
                      src={secondarySrc}
                      alt=""
                      loading="lazy"
                      draggable={false}
                      onError={() => setSecondaryFailed(true)}
                      className="size-full object-cover object-center"
                    />
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div
            role="img"
            aria-label={product.title}
            className="absolute inset-0 grid place-items-center bg-paper text-[#252525]/30"
          >
            <Glyph name={product.icon} className="size-24" />
          </div>
        )}
      </div>

      {pct > 0 && (
        <span className="absolute left-4 top-4 z-20 rounded-full bg-[#F36B0B] px-3 py-1.5 text-sm font-extrabold text-white shadow-sm sm:text-base lg:left-6 lg:top-6">
          <span dir="ltr" aria-hidden>
            -{pct}%
          </span>
          <span className="sr-only">{L.discount(pct)}</span>
        </span>
      )}

      {/* Translucent frosted info panel: always on the physical right (physical margins, never start/end), below the photos on mobile. */}
      <div className="relative z-10 m-4 flex flex-col gap-2 rounded-2xl border border-white/60 bg-[#EFEFEF]/85 p-5 shadow-lg backdrop-blur-md sm:mx-6 sm:gap-3 lg:my-8 lg:ml-auto lg:mr-10 lg:w-[34%] lg:gap-2.5 lg:p-7 xl:w-[30%]">
        <p className="text-xs font-extrabold text-[#F36B0B] lg:text-sm">{categoryName}</p>
        <h2 className="text-lg font-black leading-tight text-[#252525] sm:text-xl lg:text-2xl xl:text-3xl">
          {product.title}
        </h2>
        <p className="line-clamp-2 text-xs leading-snug text-[#525252] lg:text-sm lg:leading-relaxed">
          {product.description}
        </p>

        <p className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <span className="text-2xl font-black text-[#F36B0B] lg:text-3xl">
            <span className="sr-only">{L.newPrice}</span>
            {money(product.price, lang)}
          </span>
          {oldPrice !== undefined && (
            <del className="text-base font-medium text-[#525252]/70">
              <span className="sr-only">{L.oldPrice}</span>
              {money(oldPrice, lang)}
            </del>
          )}
        </p>

        <a href={productHref(product.id)} className={BUTTON_CLS}>
          {L.cta}
          <span className="sr-only"> — {product.title}</span>
        </a>

        {controls}
      </div>
    </div>
  )
}
