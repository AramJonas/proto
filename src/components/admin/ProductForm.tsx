import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { categories } from '../../mockData'
import {
  MAX_IMAGES,
  WARRANTY_CUSTOM,
  WARRANTY_NONE,
  discountPct,
  warrantyChoice,
  type ProductInput,
  type StoreProduct,
} from '../../store/productModel'
import { cardCls, inputCls, inputErrCls, primaryBtn, secondaryBtn } from './adminStyles'
import DiscountFields from './DiscountFields'
import ImageSlot from './ImageSlot'
import WarrantyField from './WarrantyField'

interface Props {
  /** Product being edited; omit to create a new one. */
  product?: StoreProduct
  onSubmit: (input: ProductInput) => void
  onCancel: () => void
}

interface Errors {
  name?: string
  price?: string
  discountPrice?: string
  warranty?: string
}

const slotsFrom = (images: string[]) =>
  Array.from({ length: MAX_IMAGES }, (_, i) => images[i] ?? '')

function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold text-charcoal">
      {children}
    </label>
  )
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-red-600">
      {message}
    </p>
  )
}

/** Add / edit form. Mount it with `key={product?.id ?? 'new'}` so the state resets between products. */
export default function ProductForm({ product, onSubmit, onCancel }: Props) {
  const uid = useId()
  const [name, setName] = useState(product?.name ?? '')
  const [category, setCategory] = useState(product?.category ?? categories[0].id)
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [discountOn, setDiscountOn] = useState(product?.hasDiscount ?? false)
  const [discountPrice, setDiscountPrice] = useState(
    product?.discountPrice ? String(product.discountPrice) : '',
  )
  const [wChoice, setWChoice] = useState(warrantyChoice(product?.warranty ?? ''))
  const [wCustom, setWCustom] = useState(
    warrantyChoice(product?.warranty ?? '') === WARRANTY_CUSTOM ? (product?.warranty ?? '') : '',
  )
  const [images, setImages] = useState<string[]>(() => slotsFrom(product?.images ?? []))
  const [inStock, setInStock] = useState(product?.inStock ?? true)
  const [isFeaturedHero, setIsFeaturedHero] = useState(product?.isFeaturedHero ?? false)
  const [errors, setErrors] = useState<Errors>({})

  const priceNum = Math.round(Number(price) || 0)
  const promoNum = Math.round(Number(discountPrice) || 0)

  const setSlot = (index: number, value: string) =>
    setImages((prev) => {
      if (value) return prev.map((v, i) => (i === index ? value : v))
      // Deleting a photo shifts the next ones up so slot #1 always holds the main image.
      return slotsFrom(prev.filter((_, i) => i !== index).filter(Boolean))
    })

  const submit = (ev: FormEvent) => {
    ev.preventDefault()
    const e: Errors = {}
    if (name.trim().length < 2) e.name = 'Entrez le nom du produit.'
    if (!(priceNum > 0)) e.price = 'Entrez un prix normal supérieur à 0.'
    if (discountOn) {
      if (!(promoNum > 0)) e.discountPrice = 'Entrez le nouveau prix promo.'
      else if (priceNum > 0 && promoNum >= priceNum) {
        e.discountPrice = 'Le prix promo doit être inférieur au prix normal.'
      }
    }
    if (wChoice === WARRANTY_CUSTOM && !wCustom.trim()) e.warranty = 'Précisez la garantie.'
    setErrors(e)
    const firstKey = (Object.keys(e) as (keyof Errors)[])[0]
    if (firstKey) {
      const target = document.getElementById(`${uid}-${firstKey}`)
      target?.focus()
      target?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }

    const warranty =
      wChoice === WARRANTY_NONE ? '' : wChoice === WARRANTY_CUSTOM ? wCustom.trim() : wChoice
    onSubmit({
      name,
      category,
      price: priceNum,
      hasDiscount: discountOn,
      // Kept even when the box is unchecked, so the promo can be re-applied later.
      discountPrice: promoNum > 0 ? promoNum : null,
      warranty,
      description,
      images: images.filter(Boolean),
      inStock,
      isFeaturedHero,
    })
  }

  const pct = discountOn ? discountPct(priceNum, promoNum) : 0

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {/* Photos */}
      <section className={cardCls} aria-labelledby={`${uid}-photos`}>
        <h2 id={`${uid}-photos`} className="text-base font-extrabold text-charcoal">
          Photos du produit
        </h2>
        <p className="mb-4 text-xs text-charcoal/60">
          Jusqu’à {MAX_IMAGES} images : importez un fichier ou collez un lien. La première est
          l’image principale affichée sur la boutique.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((src, i) => (
            <ImageSlot key={i} index={i} value={src} onChange={(v) => setSlot(i, v)} />
          ))}
        </div>
      </section>

      {/* Details */}
      <section className={`${cardCls} space-y-4`} aria-labelledby={`${uid}-details`}>
        <h2 id={`${uid}-details`} className="text-base font-extrabold text-charcoal">
          Détails du produit
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor={`${uid}-name`}>Nom du produit</Label>
            <input
              id={`${uid}-name`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? `${uid}-name-err` : undefined}
              placeholder="Ex : Friteuse à air numérique 6 L"
              className={`${inputCls} ${errors.name ? inputErrCls : ''}`}
            />
            <FieldError id={`${uid}-name-err`} message={errors.name} />
          </div>
          <div>
            <Label htmlFor={`${uid}-category`}>Catégorie</Label>
            <select
              id={`${uid}-category`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputCls}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor={`${uid}-description`}>Description</Label>
          <textarea
            id={`${uid}-description`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Décrivez le produit : caractéristiques, usage, contenu du colis…"
            className={`${inputCls} h-auto py-3 leading-6`}
          />
        </div>
      </section>

      {/* Price, promo, warranty */}
      <section className={`${cardCls} space-y-4`} aria-labelledby={`${uid}-pricing`}>
        <h2 id={`${uid}-pricing`} className="text-base font-extrabold text-charcoal">
          Prix, promotion et garantie
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor={`${uid}-price`}>Prix normal (DA)</Label>
            <input
              id={`${uid}-price`}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              aria-invalid={errors.price ? true : undefined}
              aria-describedby={errors.price ? `${uid}-price-err` : undefined}
              placeholder="Ex : 19500"
              className={`${inputCls} ${errors.price ? inputErrCls : ''}`}
            />
            <FieldError id={`${uid}-price-err`} message={errors.price} />
          </div>
          <div className="flex items-end">
            <label className="flex h-11 cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="size-5 cursor-pointer accent-primary"
              />
              <span className="text-sm font-bold text-charcoal">En stock</span>
            </label>
          </div>
        </div>

        <div id={`${uid}-discountPrice`} tabIndex={-1} className="outline-none">
          <DiscountFields
            price={priceNum}
            enabled={discountOn}
            onToggle={setDiscountOn}
            value={discountPrice}
            onValue={setDiscountPrice}
            error={errors.discountPrice}
          />
        </div>

        <div id={`${uid}-warranty`} tabIndex={-1} className="outline-none">
          <WarrantyField
            choice={wChoice}
            onChoice={setWChoice}
            custom={wCustom}
            onCustom={setWCustom}
          />
          <FieldError id={`${uid}-warranty-err`} message={errors.warranty} />
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-primary/5 p-3 ring-1 ring-primary/20">
            <input
              type="checkbox"
              checked={isFeaturedHero}
              onChange={(e) => setIsFeaturedHero(e.target.checked)}
              className="mt-0.5 size-5 shrink-0 cursor-pointer accent-primary"
            />
            <span>
              <span className="block text-sm font-bold text-charcoal">
                Afficher dans le Hero / Slideshow
              </span>
              <span className="block text-xs text-charcoal/60">
                Le produit apparaît dans le bandeau d’accueil de la boutique.
              </span>
            </span>
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl bg-white/95 p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] ring-1 ring-black/5 backdrop-blur">
        {pct > 0 && (
          <span className="mr-auto rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
            Promo -{pct}%
          </span>
        )}
        <button type="button" onClick={onCancel} className={secondaryBtn}>
          Annuler
        </button>
        <button type="submit" className={primaryBtn}>
          {product ? 'Enregistrer les modifications' : 'Ajouter le produit'}
        </button>
      </div>
    </form>
  )
}
