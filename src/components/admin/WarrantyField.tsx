import { useId } from 'react'
import { WARRANTY_CUSTOM, WARRANTY_NONE, WARRANTY_PRESETS } from '../../store/productModel'
import { inputCls } from './adminStyles'

interface Props {
  choice: string
  onChoice: (choice: string) => void
  custom: string
  onCustom: (value: string) => void
}

/** Optional warranty: Sans garantie / 6, 12, 24 mois / free text. */
export default function WarrantyField({ choice, onChoice, custom, onCustom }: Props) {
  const uid = useId()
  return (
    <div>
      <label htmlFor={`${uid}-w`} className="mb-1.5 block text-sm font-bold text-charcoal">
        Garantie <span className="font-medium text-charcoal/50">(optionnel)</span>
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <select
          id={`${uid}-w`}
          value={choice}
          onChange={(e) => onChoice(e.target.value)}
          className={inputCls}
        >
          <option value={WARRANTY_NONE}>Sans garantie</option>
          {WARRANTY_PRESETS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
          <option value={WARRANTY_CUSTOM}>Autre (texte libre)…</option>
        </select>
        {choice === WARRANTY_CUSTOM && (
          <input
            type="text"
            value={custom}
            onChange={(e) => onCustom(e.target.value)}
            maxLength={40}
            placeholder="Ex : 3 ans pièces et main-d'œuvre"
            aria-label="Garantie personnalisée"
            className={inputCls}
          />
        )}
      </div>
      <p className="mt-1 text-xs text-charcoal/50">
        Le badge garantie n’apparaît sur la boutique que si une garantie est renseignée.
      </p>
    </div>
  )
}
