import { useMemo, useState } from 'react'
import { Boxes, PackageX, Pencil, Percent, Plus, Search, ShieldCheck, Star, Trash2 } from 'lucide-react'
import { categories } from '../../mockData'
import { fold, formatDA } from '../../lib/format'
import { ADMIN_ADD_HREF, adminEditHref } from '../../lib/useHashRoute'
import { useProducts } from '../../store/productContext'
import {
  activeDiscountPrice,
  discountPct,
  hasActiveDiscount,
  type StoreProduct,
} from '../../store/productModel'
import { cardCls, inputCls, primaryBtn, secondaryBtn } from './adminStyles'
import Modal from './Modal'

interface Props {
  onNotify: (message: string) => void
  /** Opens the edit form so the admin can enter a promo price. */
  onNeedPromoPrice: (id: string) => void
}

function Kpi({
  label,
  value,
  Icon,
  tone,
}: {
  label: string
  value: number
  Icon: typeof Boxes
  tone: 'orange' | 'dark' | 'red'
}) {
  const toneCls = {
    orange: 'bg-primary/10 text-primary',
    dark: 'bg-charcoal/10 text-charcoal',
    red: 'bg-red-50 text-red-600',
  }[tone]
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${toneCls}`}>
        <Icon className="size-6" aria-hidden />
      </span>
      <div>
        <p className="text-3xl font-black leading-none text-charcoal">{value}</p>
        <p className="mt-1 text-sm font-semibold text-charcoal/60">{label}</p>
      </div>
    </div>
  )
}

function PromoToggle({
  product,
  onToggle,
}: {
  product: StoreProduct
  onToggle: (p: StoreProduct, next: boolean) => void
}) {
  const on = hasActiveDiscount(product)
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onToggle(product, !on)}
      aria-label={`Promo — ${product.name}`}
      className="inline-flex items-center gap-2 text-xs font-bold text-charcoal"
    >
      <span
        className={`relative inline-block h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? 'bg-primary' : 'bg-charcoal/25'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            on ? 'translate-x-5' : ''
          }`}
        />
      </span>
      {on ? 'Promo active' : 'Promo'}
    </button>
  )
}

function HeroToggle({
  product,
  onToggle,
}: {
  product: StoreProduct
  onToggle: (p: StoreProduct, next: boolean) => void
}) {
  const on = product.isFeaturedHero
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onToggle(product, !on)}
      aria-label={`Afficher dans le Hero / Slideshow — ${product.name}`}
      title="Afficher dans le Hero / Slideshow"
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition-colors ${
        on
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-black/15 bg-white text-charcoal/60 hover:border-primary hover:text-primary'
      }`}
    >
      <Star className={`size-4 ${on ? 'fill-current' : ''}`} aria-hidden />
      Hero
    </button>
  )
}

function Thumb({ product }: { product: StoreProduct }) {
  const src = product.images[0]
  return (
    <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-paper text-charcoal/30">
      {src ? (
        <img src={src} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        <Boxes className="size-6" aria-hidden />
      )}
    </span>
  )
}

function PriceCell({ product }: { product: StoreProduct }) {
  const dp = activeDiscountPrice(product)
  return (
    <div className="leading-tight">
      <p className={`text-sm font-bold ${dp ? 'text-charcoal/50 line-through' : 'text-charcoal'}`}>
        {formatDA(product.price)}
      </p>
      {dp !== null && (
        <p className="mt-0.5 text-sm font-extrabold text-primary">
          {formatDA(dp)}{' '}
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[11px] text-white">
            -{discountPct(product.price, dp)}%
          </span>
        </p>
      )}
    </div>
  )
}

function Badges({ product }: { product: StoreProduct }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {product.warranty && (
        <span className="inline-flex items-center gap-1 rounded-full bg-charcoal/[0.06] px-2 py-0.5 text-xs font-bold text-charcoal">
          <ShieldCheck className="size-3.5 text-primary" aria-hidden />
          {product.warranty}
        </span>
      )}
      {!product.inStock && (
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-600">
          Rupture
        </span>
      )}
    </div>
  )
}

function Actions({
  product,
  onDelete,
}: {
  product: StoreProduct
  onDelete: (p: StoreProduct) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <a href={adminEditHref(product.id)} className={`${secondaryBtn} h-9 px-3`}>
        <Pencil className="size-4" aria-hidden />
        Modifier
      </a>
      <button
        type="button"
        onClick={() => onDelete(product)}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-bold text-red-600 transition-colors hover:bg-red-50"
      >
        <Trash2 className="size-4" aria-hidden />
        Supprimer
      </button>
    </div>
  )
}

export default function Inventory({ onNotify, onNeedPromoPrice }: Props) {
  const { products, deleteProduct, setDiscountActive, setFeaturedHero } = useProducts()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [toDelete, setToDelete] = useState<StoreProduct | null>(null)

  const promoCount = products.filter(hasActiveDiscount).length
  const outCount = products.filter((p) => !p.inStock).length

  const q = fold(query.trim())
  const visible = useMemo(
    () =>
      products.filter((p) => {
        if (category !== 'all' && p.category !== category) return false
        return !q || fold(`${p.name} ${p.description}`).includes(q)
      }),
    [products, category, q],
  )

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id

  const togglePromo = (p: StoreProduct, next: boolean) => {
    if (setDiscountActive(p.id, next)) {
      onNotify(next ? `Promo activée : ${p.name}` : `Promo désactivée : ${p.name}`)
    } else {
      // No usable promo price stored yet → let the admin enter one.
      onNotify('Entrez d’abord un prix promo pour ce produit.')
      onNeedPromoPrice(p.id)
    }
  }

  const toggleHero = (p: StoreProduct, next: boolean) => {
    setFeaturedHero(p.id, next)
    onNotify(
      next ? `Ajouté au Hero / Slideshow : ${p.name}` : `Retiré du Hero / Slideshow : ${p.name}`,
    )
  }

  const confirmDelete = () => {
    if (!toDelete) return
    deleteProduct(toDelete.id)
    onNotify(`Produit supprimé : ${toDelete.name}`)
    setToDelete(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Kpi label="Total produits" value={products.length} Icon={Boxes} tone="dark" />
        <Kpi label="Promotions actives" value={promoCount} Icon={Percent} tone="orange" />
        <Kpi label="Produits en rupture" value={outCount} Icon={PackageX} tone="red" />
      </div>

      <section className={`${cardCls} !p-4 sm:!p-5`} aria-label="Inventaire">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-charcoal/40"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit…"
              aria-label="Rechercher un produit"
              className={`${inputCls} pl-11`}
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filtrer par catégorie"
            className={`${inputCls} md:w-72`}
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <a href={ADMIN_ADD_HREF} className={primaryBtn}>
            <Plus className="size-4" aria-hidden />
            Ajouter un produit
          </a>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-xl bg-paper p-10 text-center">
            <p className="font-bold text-charcoal">
              {products.length === 0 ? 'Aucun produit pour le moment.' : 'Aucun produit trouvé.'}
            </p>
            <p className="mt-1 text-sm text-charcoal/60">
              {products.length === 0
                ? 'Ajoutez votre premier produit ou réinitialisez les données démo.'
                : 'Modifiez la recherche ou le filtre de catégorie.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-bold uppercase tracking-wider text-charcoal/50">
                    <th scope="col" className="py-3 pr-3">Produit</th>
                    <th scope="col" className="px-3 py-3">Catégorie</th>
                    <th scope="col" className="px-3 py-3">Prix</th>
                    <th scope="col" className="px-3 py-3">Statut</th>
                    <th scope="col" className="px-3 py-3">Promo</th>
                    <th scope="col" className="px-3 py-3">Hero</th>
                    <th scope="col" className="py-3 pl-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {visible.map((p) => (
                    <tr key={p.id} className="bg-white align-middle hover:bg-paper/60">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <Thumb product={p} />
                          <span className="line-clamp-2 max-w-xs text-sm font-bold text-charcoal">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-charcoal/70">{categoryName(p.category)}</td>
                      <td className="px-3 py-3">
                        <PriceCell product={p} />
                      </td>
                      <td className="px-3 py-3">
                        <Badges product={p} />
                      </td>
                      <td className="px-3 py-3">
                        <PromoToggle product={p} onToggle={togglePromo} />
                      </td>
                      <td className="px-3 py-3">
                        <HeroToggle product={p} onToggle={toggleHero} />
                      </td>
                      <td className="py-3 pl-3">
                        <Actions product={p} onDelete={setToDelete} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="space-y-3 md:hidden">
              {visible.map((p) => (
                <li key={p.id} className="space-y-3 rounded-xl border border-black/10 bg-white p-3">
                  <div className="flex gap-3">
                    <Thumb product={p} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="line-clamp-2 text-sm font-bold text-charcoal">{p.name}</p>
                      <p className="text-xs text-charcoal/60">{categoryName(p.category)}</p>
                      <PriceCell product={p} />
                    </div>
                  </div>
                  <Badges product={p} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <PromoToggle product={p} onToggle={togglePromo} />
                    <HeroToggle product={p} onToggle={toggleHero} />

                    <Actions product={p} onDelete={setToDelete} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {toDelete && (
        <Modal
          title="Supprimer ce produit ?"
          onClose={() => setToDelete(null)}
          footer={
            <>
              <button type="button" onClick={() => setToDelete(null)} className={secondaryBtn}>
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-bold text-white hover:bg-red-700"
              >
                Supprimer
              </button>
            </>
          }
        >
          <p>
            « <b className="text-charcoal">{toDelete.name}</b> » sera retiré de l’inventaire et de la
            boutique immédiatement.
          </p>
        </Modal>
      )}
    </div>
  )
}
