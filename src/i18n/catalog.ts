/**
 * catalog.ts — localized view of the data in mockData.ts.
 *
 * French is the source language (mockData.ts). Arabic text is layered on top by id / code, so
 * swapping mockData for backend data only requires providing the same ids in the `ar*` files
 * (or fetching localized fields directly and deleting this overlay).
 *
 * Products do NOT come from mockData.ts: pass the shared product store's current list to
 * getCatalog() so every change made in the admin dashboard shows up on the storefront.
 */
import {
  categories,
  hero,
  store,
  trustItems,
  wilayas,
  type Category,
  type HeroContent,
  type Product,
  type StoreConfig,
  type TrustItem,
  type Wilaya,
} from '../mockData'
import type { StoreProduct } from '../store/productModel'
import { toStorefrontProduct } from '../store/storefrontProduct'
import { arWilayas } from './arWilayas'
import type { Lang } from './translations'

export interface Catalog {
  store: StoreConfig
  hero: HeroContent
  trustItems: TrustItem[]
  categories: Category[]
  products: Product[]
  wilayas: Wilaya[]
}

const arStore: Pick<StoreConfig, 'tagline' | 'announcement' | 'address'> = {
  tagline: 'متجرك الإلكتروني في الجزائر',
  announcement: 'التوصيل إلى 58 ولاية — الدفع عند الاستلام مع ZR Express أو DHD',
  address: ' باتنة، الجزائر',
}

const arHero: HeroContent = {
  eyebrow: 'عروض الأسبوع',
  title: 'تخفيضات تصل إلى 40% على أساسياتك',
  text: 'اطلب في دقيقة واحدة وادفع فقط عند استلام طلبك.',
  cta: 'شاهد التخفيضات',
}

/** Same order as `trustItems` in mockData.ts. */
const arTrust: Pick<TrustItem, 'title' | 'text'>[] = [
  { title: 'التوصيل إلى 58 ولاية', text: 'إلى المنزل أو مكتب bureau' },
  { title: 'الدفع عند الاستلام', text: 'ادفع عند استلام طلبك' },
  { title: 'استبدال خلال 7 أيام', text: 'في حال وجود عيب' },
  { title: 'دعم 7/7', text: 'واتساب وهاتف' },
]

const arCategories: Record<string, string> = {
  entretien: 'الصيانة والكي',
  air: 'الهواء والراحة',
  cuisine: 'الأجهزة الصغيرة',
  cuisson: 'الطهي والأجهزة الكبيرة',
}

type StaticCatalog = Omit<Catalog, 'products'>

/** Everything except the products is static, so it is built once per language. */
const frStatic: StaticCatalog = { store, hero, trustItems, categories, wilayas }

const arStatic: StaticCatalog = {
  store: { ...store, ...arStore },
  hero: arHero,
  trustItems: trustItems.map((t, i) => ({ ...t, ...arTrust[i] })),
  categories: categories.map((c) => ({ ...c, name: arCategories[c.id] ?? c.name })),
  wilayas: wilayas.map((w) => ({ ...w, name: arWilayas[w.code] ?? w.name })),
}

export const getCatalog = (lang: Lang, storeProducts: StoreProduct[]): Catalog => ({
  ...(lang === 'ar' ? arStatic : frStatic),
  products: storeProducts.map((p) => toStorefrontProduct(p, lang)),
})
