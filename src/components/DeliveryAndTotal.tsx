import { useLang } from '../i18n/langContext'
import { formatDZD, shippingRate, type DeliveryType } from '../lib/format'
import type { Wilaya } from '../mockData'
import { HomeIcon, PackageIcon } from './Icons'

/** Home vs Stop Desk toggle; each option previews the rate for the selected wilaya. */
export function DeliveryToggle({
  value,
  wilaya,
  onChange,
}: {
  value: DeliveryType
  wilaya: Wilaya | undefined
  onChange: (d: DeliveryType) => void
}) {
  const { t } = useLang()
  const options = [
    { id: 'home', label: t.delivery.home, icon: <HomeIcon className="size-4" /> },
    { id: 'desk', label: t.delivery.desk, icon: <PackageIcon className="size-4" /> },
  ] as const
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-bold text-charcoal">{t.form.deliveryType}</legend>
      <div role="radiogroup" className="grid grid-cols-2 gap-2 rounded-xl bg-paper p-1">
        {options.map((opt) => {
          const active = value === opt.id
          const rate = shippingRate(wilaya, opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.id)}
              className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-2 py-1.5 text-sm font-bold transition-colors ${
                active ? 'bg-primary text-white shadow-sm' : 'text-charcoal hover:bg-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {opt.icon}
                {opt.label}
              </span>
              <span
                className={`text-xs font-semibold ${active ? 'text-white/90' : 'text-charcoal/60'}`}
              >
                {rate !== null ? formatDZD(rate) : '—'}
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function TotalBox({
  unitPrice,
  quantity,
  subtotal,
  wilaya,
  shipping,
  total,
}: {
  unitPrice: number
  quantity: number
  subtotal: number
  wilaya: Wilaya | undefined
  shipping: number | null
  total: number
}) {
  const { t } = useLang()
  return (
    <dl className="space-y-1.5 rounded-xl bg-paper p-4 text-sm">
      <div className="flex justify-between gap-3">
        <dt className="text-charcoal/70">{t.form.subtotal(quantity, formatDZD(unitPrice))}</dt>
        <dd className="font-semibold">{formatDZD(subtotal)}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-charcoal/70">
          {t.form.shipping} {wilaya ? `— ${wilaya.name}` : ''}
        </dt>
        <dd className="font-semibold">
          {shipping !== null ? formatDZD(shipping) : t.form.chooseWilaya}
        </dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-charcoal/10 pt-2.5">
        <dt className="text-base font-extrabold text-charcoal">{t.form.total}</dt>
        <dd aria-live="polite" className="text-2xl font-extrabold text-primary">
          {formatDZD(total)}
        </dd>
      </div>
    </dl>
  )
}
