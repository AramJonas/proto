import { useLang } from '../i18n/langContext'
import { carrierLabel, formatDZD, shippingRate, type DeliveryType } from '../lib/format'
import { CARRIERS, type Carrier } from '../lib/shippingTariffs'
import type { Wilaya } from '../mockData'
import { HomeIcon, PackageIcon } from './Icons'

/** ZR Express vs DHD Express toggle; each option previews its cheapest fee for the selected wilaya. */
export function CarrierToggle({
  value,
  wilaya,
  delivery,
  onChange,
}: {
  value: Carrier
  wilaya: Wilaya | undefined
  delivery: DeliveryType
  onChange: (c: Carrier) => void
}) {
  const { t } = useLang()
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-bold text-charcoal">{t.form.carrier}</legend>
      <div role="radiogroup" className="grid grid-cols-2 gap-2.5 rounded-xl bg-paper p-1">
        {CARRIERS.map((id) => {
          const active = value === id
          const rate = shippingRate(wilaya, id, delivery)
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(id)}
              className={`flex min-h-[44px] flex-col items-center justify-center rounded-lg px-2 py-1.5 text-sm font-bold transition-colors ${
                active ? 'bg-primary text-white shadow-sm' : 'text-charcoal hover:bg-white'
              }`}
            >
              <span>{carrierLabel(id)}</span>
              {rate !== null && (
                <span
                  className={`text-xs font-semibold ${active ? 'text-white/90' : 'text-charcoal/60'}`}
                >
                  {formatDZD(rate)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Home vs Stop Desk toggle; each option previews the rate for the selected wilaya and carrier. */
export function DeliveryToggle({
  value,
  wilaya,
  carrier,
  onChange,
}: {
  value: DeliveryType
  wilaya: Wilaya | undefined
  carrier: Carrier
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
          const rate = shippingRate(wilaya, carrier, opt.id)
          const unavailable = !!wilaya && rate === null
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={unavailable}
              onClick={() => onChange(opt.id)}
              className={`flex min-h-14 flex-col items-center justify-center rounded-lg px-2 py-1.5 text-sm font-bold transition-colors ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : unavailable
                    ? 'cursor-not-allowed text-charcoal/35'
                    : 'text-charcoal hover:bg-white'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {opt.icon}
                {opt.label}
              </span>
              <span
                className={`text-xs font-semibold ${active ? 'text-white/90' : 'text-charcoal/60'}`}
              >
                {rate !== null ? formatDZD(rate) : unavailable ? t.form.deskUnavailable : '—'}
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
