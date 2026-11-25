import { useId, type ReactNode } from 'react'
import { formatDZD } from '../lib/format'
import type { Product } from '../mockData'
import { MAX_QTY } from '../lib/formHelpers'
import Glyph from './Glyph'
import { MinusIcon, PlusIcon } from './Icons'

export function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-bold text-charcoal">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}

/** Read-only summary proving the form is bound to this exact product. */
export function BoundProduct({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-paper p-3">
      <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-white text-3xl">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt="" className="size-full object-cover" />
        ) : (
          <Glyph name={product.icon} className="size-8 text-charcoal/40" />
        )}
      </span>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-bold text-charcoal">{product.title}</p>
        <p className="text-sm font-extrabold text-primary">
          {formatDZD(product.price)}
          {product.oldPrice && product.oldPrice > product.price && (
            <del className="ml-2 text-xs font-medium text-charcoal/50">
              {formatDZD(product.oldPrice)}
            </del>
          )}
        </p>
      </div>
    </div>
  )
}

export function VariantPicker({
  product,
  value,
  onChange,
}: {
  product: Product
  value: string | undefined
  onChange: (v: string) => void
}) {
  if (!product.variants?.length) return null
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-bold text-charcoal">
        {product.variantLabel ?? 'Variante'} : <span className="text-primary">{value}</span>
      </legend>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {product.variants.map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={`h-11 min-w-12 rounded-xl border px-4 text-sm font-bold transition-colors ${
              value === v
                ? 'border-primary bg-primary text-white'
                : 'border-charcoal/15 bg-white text-charcoal hover:border-primary'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function QuantityStepper({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  const uid = useId()
  const stepBtn =
    'grid size-12 place-items-center text-charcoal transition-colors hover:text-primary disabled:text-charcoal/25 disabled:hover:text-charcoal/25'
  return (
    <div>
      <span id={uid} className="mb-1.5 block text-sm font-bold text-charcoal">
        Quantité
      </span>
      <div
        role="group"
        aria-labelledby={uid}
        className="inline-flex items-center rounded-xl border border-charcoal/15 bg-white"
      >
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          aria-label="Diminuer la quantité"
          className={stepBtn}
        >
          <MinusIcon className="size-5" />
        </button>
        <output aria-live="polite" className="w-10 text-center text-base font-extrabold">
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(MAX_QTY, value + 1))}
          disabled={value >= MAX_QTY}
          aria-label="Augmenter la quantité"
          className={stepBtn}
        >
          <PlusIcon className="size-5" />
        </button>
      </div>
    </div>
  )
}
