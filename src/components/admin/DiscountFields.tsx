import { useId } from 'react'
import { discountPct, suggestPromoPrice } from '../../store/productModel'
import { formatDA } from '../../lib/format'
import { inputCls, inputErrCls } from './adminStyles'

interface Props {
  /** Regular price currently typed in the form (0 when empty / invalid). */
  price: number
  enabled: boolean
  onToggle: (enabled: boolean) => void
  /** Promo price field value (kept while the checkbox is off so it can be re-applied). */
  value: string
  onValue: (value: string) => void
  error?: string
}

const QUICK_PCTS = [10, 20, 30]

/** "En promotion" checkbox + promo price input + live "-xx %" badge. */
export default function DiscountFields({ price, enabled, onToggle, value, onValue, error }: Props) {
  const uid = useId()
  const promo = Math.round(Number(value) || 0)
  const pct = discountPct(price, promo)
  const remembered = !enabled && promo > 0 && promo < price

  return (
    <div className="rounded-xl border border-black/10 bg-paper/60 p-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="size-5 shrink-0 cursor-pointer accent-primary"
        />
        <span className="text-sm font-bold text-charcoal">En promotion (Discount)</span>
        {enabled && pct > 0 && (
          <span className="ml-auto rounded-full bg-primary px-2.5 py-1 text-xs font-extrabold text-white">
            -{pct}%
          </span>
        )}
      </label>

      {enabled ? (
        <div className="mt-4 space-y-3">
          <div>
            <label htmlFor={`${uid}-promo`} className="mb-1.5 block text-sm font-bold text-charcoal">
              Nouveau prix promo (DA)
            </label>
            <input
              id={`${uid}-promo`}
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={value}
              onChange={(e) => onValue(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${uid}-err` : undefined}
              placeholder={price > 0 ? `Inférieur à ${formatDA(price)}` : 'Entrez d’abord le prix normal'}
              className={`${inputCls} ${error ? inputErrCls : ''}`}
            />
            {error && (
              <p id={`${uid}-err`} role="alert" className="mt-1 text-xs font-medium text-red-600">
                {error}
              </p>
            )}
          </div>

          {price > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-charcoal/60">Raccourcis :</span>
              {QUICK_PCTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onValue(String(suggestPromoPrice(price, p)))}
                  className="h-8 rounded-full border border-black/15 bg-white px-3 text-xs font-bold text-charcoal transition-colors hover:border-primary hover:text-primary"
                >
                  -{p}%
                </button>
              ))}
            </div>
          )}

          {pct > 0 && (
            <p className="text-sm text-charcoal/70">
              Affiché sur la boutique :{' '}
              <del className="text-charcoal/50">{formatDA(price)}</del>{' '}
              <b className="text-primary">{formatDA(promo)}</b>{' '}
              <span className="font-bold text-charcoal">(-{pct}%)</span>
            </p>
          )}
        </div>
      ) : (
        <p className="mt-2 pl-8 text-xs text-charcoal/60">
          {remembered
            ? `La boutique affiche le prix normal. Ancien prix promo mémorisé : ${formatDA(promo)} — cochez la case pour le réappliquer.`
            : 'La boutique affiche le prix normal. Cochez la case pour définir un prix promo.'}
        </p>
      )}
    </div>
  )
}
