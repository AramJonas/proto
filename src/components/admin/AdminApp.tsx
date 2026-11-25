import { useEffect, useState } from 'react'
import { RotateCcw, Star, TriangleAlert } from 'lucide-react'
import { ADMIN_HREF, adminEditHref, type AdminView } from '../../lib/useHashRoute'
import { useToast } from '../../lib/useToast'
import { useProducts } from '../../store/productContext'
import { SearchIcon } from '../Icons'
import Toast from '../Toast'
import AdminSidebar from './AdminSidebar'
import { cardCls, darkBtn, primaryBtn, secondaryBtn } from './adminStyles'
import Inventory from './Inventory'
import Modal from './Modal'
import ProductForm from './ProductForm'

type Props = { route: { name: 'admin' } & AdminView }

const TITLES = {
  inventory: 'Inventaire / Produits',
  add: 'Ajouter un produit',
  edit: 'Modifier le produit',
} as const

const goInventory = () => {
  window.location.hash = ADMIN_HREF
}

/** /admin — same shared product store as the storefront, so every save is live there. */
export default function AdminApp({ route }: Props) {
  const { products, addProduct, updateProduct, resetToDemo, storageError } = useProducts()
  const toast = useToast()
  const [confirmReset, setConfirmReset] = useState(false)
  const heroCount = products.filter((p) => p.isFeaturedHero).length

  useEffect(() => {
    document.title = 'Admin — MoulinaxxBatna'
    window.scrollTo({ top: 0 })
  }, [route.view])

  const editing = route.view === 'edit' ? products.find((p) => p.id === route.id) : undefined

  // The admin UI is French-only: force LTR so the sidebar always stays on the left, even when
  // the storefront language (Arabic) has switched <html dir> to "rtl".
  return (
    <div dir="ltr" lang="fr" className="min-h-screen bg-paper text-charcoal lg:flex lg:flex-row">
      <AdminSidebar view={route.view} />

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-black/5 bg-white">
          <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <h1 className="truncate text-lg font-extrabold text-charcoal sm:text-xl">
              {TITLES[route.view]}
            </h1>
            <div className="ml-auto flex items-center gap-2">
            <span
              role="status"
              title={
                heroCount === 0
                  ? 'Aucun produit sélectionné : la boutique affichera les premiers produits.'
                  : 'Produits affichés dans le Hero / Slideshow'
              }
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold ${
                heroCount === 0
                  ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-300'
                  : 'bg-primary/10 text-primary'
              }`}
            >
              {heroCount === 0 ? (
                <TriangleAlert className="size-3.5" aria-hidden />
              ) : (
                <Star className="size-3.5 fill-current" aria-hidden />
              )}
              Hero: {heroCount} {heroCount > 1 ? 'actifs' : 'actif'}
              {heroCount === 0 && <span className="hidden md:inline">— aucun sélectionné</span>}
            </span>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-black/15 px-3 text-xs font-bold text-charcoal/80 transition-colors hover:border-primary hover:text-primary"
            >
              <RotateCcw className="size-3.5" aria-hidden />
              <span className="hidden sm:inline">Réinitialiser les données démo</span>
              <span className="sm:hidden">Réinitialiser</span>
            </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
          {storageError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 ring-1 ring-amber-200"
            >
              <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
              <p>
                Le stockage du navigateur est plein ou indisponible : les modifications restent
                visibles pendant cette session mais ne seront pas conservées. Préférez des liens
                d’images aux fichiers importés, ou supprimez des photos.
              </p>
            </div>
          )}

          {route.view === 'inventory' && (
            <Inventory
              onNotify={toast.show}
              onNeedPromoPrice={(id) => {
                window.location.hash = adminEditHref(id)
              }}
            />
          )}

          {route.view === 'add' && (
            <ProductForm
              key="new"
              onCancel={goInventory}
              onSubmit={(input) => {
                const created = addProduct(input)
                toast.show(`Produit ajouté : ${created.name}`)
                goInventory()
              }}
            />
          )}

          {route.view === 'edit' &&
            (editing ? (
              <ProductForm
                key={editing.id}
                product={editing}
                onCancel={goInventory}
                onSubmit={(input) => {
                  updateProduct(editing.id, input)
                  toast.show(`Produit mis à jour : ${input.name.trim()}`)
                  goInventory()
                }}
              />
            ) : (
              <div className={`${cardCls} mx-auto max-w-md text-center`}>
                <SearchIcon className="mx-auto size-10 text-charcoal/40" />
                <p className="mt-3 font-bold">Produit introuvable</p>
                <p className="mt-1 text-sm text-charcoal/60">Il a peut-être été supprimé.</p>
                <a href={ADMIN_HREF} className={`${primaryBtn} mt-4`}>
                  Retour à l’inventaire
                </a>
              </div>
            ))}
        </main>
      </div>

      {confirmReset && (
        <Modal
          title="Réinitialiser les données démo ?"
          onClose={() => setConfirmReset(false)}
          footer={
            <>
              <button type="button" onClick={() => setConfirmReset(false)} className={secondaryBtn}>
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDemo()
                  setConfirmReset(false)
                  toast.show('Données démo restaurées.')
                  goInventory()
                }}
                className={darkBtn}
              >
                Réinitialiser
              </button>
            </>
          }
        >
          <p>
            Tous vos ajouts, modifications et suppressions seront remplacés par les produits
            d’origine de la boutique.
          </p>
        </Modal>
      )}

      <Toast message={toast.message} />
    </div>
  )
}
