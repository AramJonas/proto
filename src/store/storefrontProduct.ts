import { categories, type Product } from '../mockData'
import { arProducts } from '../i18n/arProducts'
import type { Lang } from '../i18n/translations'
import { activeDiscountPrice, currentPrice, type StoreProduct } from './productModel'
import { SEED_BY_ID, SEED_EXTRAS } from './seedProducts'

/**
 * Store record → what the storefront components render.
 *
 * - Promo: `oldPrice` is set (to the regular price) only while a valid promotion is active.
 * - Product names are never translated: `title` is always the French name, in every language.
 * - Arabic: the bundled Arabic copy (description, features, variants) is applied only to demo
 *   products whose French text has not been edited in the admin; new / edited products show the
 *   text exactly as entered.
 * - Icon / feature bullets / variants are storefront-only extras of the demo catalogue.
 */
export function toStorefrontProduct(p: StoreProduct, lang: Lang): Product {
  const extras = SEED_EXTRAS[p.id]
  const seed = SEED_BY_ID.get(p.id)
  const ar = lang === 'ar' ? arProducts[p.id] : undefined

  const promo = activeDiscountPrice(p) !== null
  return {
    id: p.id,
    categoryId: p.category,
    title: p.name,
    price: currentPrice(p),
    oldPrice: promo ? p.price : undefined,
    icon: extras?.icon ?? categories.find((c) => c.id === p.category)?.icon ?? 'shopping-bag',
    images: p.images.length ? p.images : undefined,
    description: ar && seed?.description === p.description ? ar.description : p.description,
    features: ar?.features ?? extras?.features ?? [],
    variantLabel: ar ? ar.variantLabel : extras?.variantLabel,
    variants: ar ? ar.variants : extras?.variants,
    warranty: p.warranty || undefined,
    inStock: p.inStock,
  }
}
