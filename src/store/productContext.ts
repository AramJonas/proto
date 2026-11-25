import { createContext, useContext } from 'react'
import type { ProductInput, StoreProduct } from './productModel'

export interface ProductStore {
  /** Every product, in display order (new products are appended). */
  products: StoreProduct[]
  addProduct: (input: ProductInput) => StoreProduct
  /** Replaces the editable fields of a product. No-op for an unknown id. */
  updateProduct: (id: string, input: ProductInput) => void
  deleteProduct: (id: string) => void
  /**
   * Quick promo switch. Turning it on only works when a valid promo price (< regular price) is
   * already stored; returns false otherwise so the caller can ask for a price.
   */
  setDiscountActive: (id: string, active: boolean) => boolean
  /** Adds / removes a product from the storefront Hero / Slideshow. */
  setFeaturedHero: (id: string, featured: boolean) => void
  /** Restores the default demo catalogue (replaces everything). */
  resetToDemo: () => void
  /** True when the last save to localStorage failed (quota exceeded, storage disabled…). */
  storageError: boolean
}

export const ProductContext = createContext<ProductStore | null>(null)

export function useProducts(): ProductStore {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used inside <ProductProvider>')
  return ctx
}
