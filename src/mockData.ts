/**
 * mockData.ts — static storefront settings for the prototype.
 *
 * Store settings, categories and Wilaya shipping rates live here. PRODUCTS do not: they are owned
 * by the shared client-side product store (src/store — seeded from src/store/seedProducts.ts and
 * persisted in localStorage) so the admin dashboard can edit them live. After client approval,
 * replace these constants / the store persistence with data fetched from your backend — the
 * TypeScript types below describe the exact shape the UI expects.
 *
 * All prices are integers in Algerian Dinar (DA / DZD).
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface StoreConfig {
  name: string
  tagline: string
  announcement: string
  /** Owner phone as displayed to customers. */
  phoneDisplay: string
  /** Owner phone in E.164 format for `tel:` links. */
  phoneTel: string
  /** WhatsApp number, digits only, with country code and no "+" (wa.me format). */
  whatsappNumber: string
  email: string
  address: string
  social: {
    instagram: string
    facebook: string
    tiktok: string
  }
}

export type TrustIcon = 'truck' | 'cash' | 'refresh' | 'chat'

export interface TrustItem {
  icon: TrustIcon
  title: string
  text: string
}

export interface HeroContent {
  eyebrow: string
  title: string
  text: string
  cta: string
}

/** Icon keys available to categories / products (rendered as SVG by components/Glyph.tsx). */
export type IconName =
  | 'air-vent'
  | 'blend'
  | 'bot'
  | 'brush-cleaning'
  | 'cloud-fog'
  | 'coffee'
  | 'cooking-pot'
  | 'droplets'
  | 'fan'
  | 'feather'
  | 'flame'
  | 'glass-water'
  | 'grid'
  | 'heater'
  | 'leaf'
  | 'lightbulb'
  | 'microwave'
  | 'refrigerator'
  | 'sandwich'
  | 'scissors'
  | 'shirt'
  | 'shopping-bag'
  | 'soup'
  | 'tag'
  | 'utensils'
  | 'utensils-crossed'
  | 'waves'
  | 'wind'

export interface Category {
  id: string
  name: string
  icon: IconName
}

/**
 * Storefront-facing view of a product, derived from a `StoreProduct` (src/store/productModel.ts)
 * by `toStorefrontProduct()` in src/store/storefrontProduct.ts.
 */
export interface Product {
  id: string
  categoryId: Category['id']
  title: string
  /** Price the customer pays (the promo price while a promotion is active). */
  price: number
  /** Regular price (DA). Set only while a promotion is active: the card then shows a "Promo !" badge. */
  oldPrice?: number
  /** Placeholder icon, shown while the product has no photo. */
  icon: IconName
  /** Photo URLs, cover first. Omit to fall back to the icon. */
  images?: string[]
  description: string
  features: string[]
  /** Variant selector (e.g. "Couleur", "Pointure"). Omit for single-variant products. */
  variantLabel?: string
  variants?: string[]
  /** Optional warranty label (e.g. "12 mois"). Shown on the card / page only when set. */
  warranty?: string
  /** False → displayed as out of stock; cannot be ordered. */
  inStock: boolean
}

export interface Wilaya {
  code: string
  name: string
}

/* ------------------------------------------------------------------ */
/* Store                                                               */
/* ------------------------------------------------------------------ */

export const store: StoreConfig = {
  name: 'MoulinaxxBatna',
  tagline: 'Votre boutique en ligne en Algérie',
  announcement: 'Livraison dans les 58 wilayas Avec ZR Express et DHD Paiement à la livraison',
  phoneDisplay: '0773 50 62 28',
  phoneTel: '+213773506228',
  whatsappNumber: '213773506228',
  email: 'contact@moulinaxx.dz',
  address: 'Batna, Algérie',
  social: {
    instagram: 'https://www.instagram.com/moulinaxxbatna/',
    facebook: 'https://www.facebook.com/profile.php?id=61574676680851',
    tiktok: 'https://www.tiktok.com/@moulinexb',
  },
}

export const hero: HeroContent = {
  eyebrow: 'Offres de la semaine',
  title: "Jusqu'à -40% sur vos essentiels",
  text: 'Commandez en 1 minute, payez uniquement à la réception de votre colis.',
  cta: 'Voir les promos',
}

export const trustItems: TrustItem[] = [
  { icon: 'truck', title: 'Livraison 58 wilayas', text: 'Domicile ou Bureau' },
  { icon: 'cash', title: 'Paiement à la livraison', text: 'Payez à la réception' },
  { icon: 'refresh', title: 'Échange sous 7 jours', text: 'En cas de défaut' },
  { icon: 'chat', title: 'Support 7j/7', text: 'WhatsApp & téléphone' },
]

/* ------------------------------------------------------------------ */
/* Categories                                                          */
/* ------------------------------------------------------------------ */

export const categories: Category[] = [
  { id: 'entretien', name: 'Entretien & Repassage', icon: 'brush-cleaning' },
  { id: 'air', name: 'Air & Confort', icon: 'leaf' },
  { id: 'cuisine', name: 'Petit électroménager', icon: 'coffee' },
  { id: 'cuisson', name: 'Cuisson & Gros électroménager', icon: 'cooking-pot' },
]

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

// Products no longer live here: the catalogue is owned by the shared product store (src/store),
// seeded from src/store/seedProducts.ts. `Product` above is the storefront-facing view of a store product.

/* ------------------------------------------------------------------ */
/* Wilayas (shipping rates: src/lib/shippingTariffs.ts)              */
/* ------------------------------------------------------------------ */

export const wilayas: Wilaya[] = [
  { code: '01', name: 'Adrar' },
  { code: '02', name: 'Chlef' },
  { code: '03', name: 'Laghouat' },
  { code: '04', name: 'Oum El Bouaghi' },
  { code: '05', name: 'Batna' },
  { code: '06', name: 'Béjaïa' },
  { code: '07', name: 'Biskra' },
  { code: '08', name: 'Béchar' },
  { code: '09', name: 'Blida' },
  { code: '10', name: 'Bouira' },
  { code: '11', name: 'Tamanrasset' },
  { code: '12', name: 'Tébessa' },
  { code: '13', name: 'Tlemcen' },
  { code: '14', name: 'Tiaret' },
  { code: '15', name: 'Tizi Ouzou' },
  { code: '16', name: 'Alger' },
  { code: '17', name: 'Djelfa' },
  { code: '18', name: 'Jijel' },
  { code: '19', name: 'Sétif' },
  { code: '20', name: 'Saïda' },
  { code: '21', name: 'Skikda' },
  { code: '22', name: 'Sidi Bel Abbès' },
  { code: '23', name: 'Annaba' },
  { code: '24', name: 'Guelma' },
  { code: '25', name: 'Constantine' },
  { code: '26', name: 'Médéa' },
  { code: '27', name: 'Mostaganem' },
  { code: '28', name: "M'Sila" },
  { code: '29', name: 'Mascara' },
  { code: '30', name: 'Ouargla' },
  { code: '31', name: 'Oran' },
  { code: '32', name: 'El Bayadh' },
  { code: '33', name: 'Illizi' },
  { code: '34', name: 'Bordj Bou Arréridj' },
  { code: '35', name: 'Boumerdès' },
  { code: '36', name: 'El Tarf' },
  { code: '37', name: 'Tindouf' },
  { code: '38', name: 'Tissemsilt' },
  { code: '39', name: 'El Oued' },
  { code: '40', name: 'Khenchela' },
  { code: '41', name: 'Souk Ahras' },
  { code: '42', name: 'Tipaza' },
  { code: '43', name: 'Mila' },
  { code: '44', name: 'Aïn Defla' },
  { code: '45', name: 'Naâma' },
  { code: '46', name: 'Aïn Témouchent' },
  { code: '47', name: 'Ghardaïa' },
  { code: '48', name: 'Relizane' },
  { code: '49', name: "El M'Ghair" },
  { code: '50', name: 'El Menia' },
  { code: '51', name: 'Ouled Djellal' },
  { code: '52', name: 'Bordj Badji Mokhtar' },
  { code: '53', name: 'Béni Abbès' },
  { code: '54', name: 'Timimoun' },
  { code: '55', name: 'Touggourt' },
  { code: '56', name: 'Djanet' },
  { code: '57', name: 'In Salah' },
  { code: '58', name: 'In Guezzam' },
]

