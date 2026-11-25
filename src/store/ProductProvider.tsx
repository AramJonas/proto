import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ProductContext, type ProductStore } from './productContext'
import {
  hasActiveDiscount,
  normalizeInput,
  sanitizeProduct,
  uniqueId,
  type ProductInput,
  type StoreProduct,
} from './productModel'
import { SEED_HERO_IDS, fromStoredImage, getSeedProducts, toStoredImage } from './seedProducts'

/** Bump the suffix when the stored shape changes incompatibly. */
const STORAGE_KEY = 'moulinaxx:products:v1'

interface Persisted {
  version: 1
  products: StoreProduct[]
}

/** Reads the catalogue from localStorage; falls back to the demo seed when missing or corrupted. */
function load(): StoreProduct[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Persisted>
      if (parsed && Array.isArray(parsed.products)) {
        const seen = new Set<string>()
        const list: StoreProduct[] = []
        // Data saved before `isFeaturedHero` existed: apply the demo hero defaults once.
        const legacy = !parsed.products.some(
          (item) => !!item && typeof item === 'object' && 'isFeaturedHero' in item,
        )
        for (const item of parsed.products) {
          const p = sanitizeProduct(item)
          if (!p || seen.has(p.id)) continue
          seen.add(p.id)
          list.push({
            ...p,
            isFeaturedHero: legacy ? SEED_HERO_IDS.has(p.id) : p.isFeaturedHero,
            images: p.images.map(fromStoredImage).filter((u): u is string => u !== null),
          })
        }
        return list
      }
    }
  } catch {
    /* unreadable → seed */
  }
  return getSeedProducts()
}

/** Returns false when the write failed (quota exceeded / storage unavailable). */
function save(products: StoreProduct[]): boolean {
  try {
    const payload: Persisted = {
      version: 1,
      products: products.map((p) => ({ ...p, images: p.images.map(toStoredImage) })),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

/**
 * Shared client-side product store. Seeded with the storefront catalogue, persisted in localStorage
 * and kept in sync across browser tabs (the `storage` event), so a change made in /admin shows up
 * on the storefront immediately — in the same tab and in any other open tab.
 */
export default function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<StoreProduct[]>(load)
  const [storageError, setStorageError] = useState(false)
  // Always holds the latest list so several quick actions never work on a stale snapshot.
  const latest = useRef(products)

  const commit = useCallback((next: StoreProduct[]) => {
    latest.current = next
    setProducts(next)
    setStorageError(!save(next))
  }, [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return
      const next = load()
      latest.current = next
      setProducts(next)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const addProduct = useCallback(
    (input: ProductInput): StoreProduct => {
      const data = normalizeInput(input)
      const taken = new Set(latest.current.map((p) => p.id))
      const product: StoreProduct = { id: uniqueId(data.name, taken), ...data }
      commit([...latest.current, product])
      return product
    },
    [commit],
  )

  const updateProduct = useCallback(
    (id: string, input: ProductInput) => {
      const data = normalizeInput(input)
      commit(latest.current.map((p) => (p.id === id ? { id, ...data } : p)))
    },
    [commit],
  )

  const deleteProduct = useCallback(
    (id: string) => commit(latest.current.filter((p) => p.id !== id)),
    [commit],
  )

  const setDiscountActive = useCallback(
    (id: string, active: boolean): boolean => {
      const target = latest.current.find((p) => p.id === id)
      if (!target) return false
      if (active && !hasActiveDiscount({ ...target, hasDiscount: true })) return false
      commit(latest.current.map((p) => (p.id === id ? { ...p, hasDiscount: active } : p)))
      return true
    },
    [commit],
  )

  const setFeaturedHero = useCallback(
    (id: string, featured: boolean) =>
      commit(latest.current.map((p) => (p.id === id ? { ...p, isFeaturedHero: featured } : p))),
    [commit],
  )

  const resetToDemo = useCallback(() => commit(getSeedProducts()), [commit])

  const value = useMemo<ProductStore>(
    () => ({
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      setDiscountActive,
      setFeaturedHero,
      resetToDemo,
      storageError,
    }),
    [
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      setDiscountActive,
      setFeaturedHero,
      resetToDemo,
      storageError,
    ],
  )

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}
