import { useLang } from '../i18n/langContext'
import { deliveryLabel, formatDZD, type OrderSnapshot } from '../lib/format'
import { HOME_HREF } from '../lib/useHashRoute'
import { store } from '../mockData'
import { CheckIcon } from './Icons'

interface Props {
  order: OrderSnapshot
  reference: string
  onEdit: () => void
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <dt className="text-charcoal/60">{label}</dt>
      <dd className="text-end font-semibold text-charcoal">{value}</dd>
    </div>
  )
}

/** Clean confirmation summary shown after a successful COD submit. */
export default function OrderConfirmation({ order, reference, onEdit }: Props) {
  const { t } = useLang()
  const c = t.confirmation
  const { product, variant, quantity, wilaya, delivery, shipping, subtotal, total } = order
  return (
    <div className="text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary text-white">
        <CheckIcon className="size-8" strokeWidth={3} />
      </div>
      <h2 className="mt-4 text-xl font-extrabold text-charcoal">{c.title}</h2>
      <p className="mt-1 text-sm text-charcoal/70">
        {c.thanksBefore(order.fullName?.split(' ')[0] ?? '')}{' '}
        <b dir="ltr" className="text-charcoal">
          {order.phone}
        </b>{' '}
        {c.thanksAfter}
      </p>
      <p className="mt-3 inline-block rounded-full bg-paper px-3 py-1 text-xs font-bold text-charcoal">
        {c.reference} : <span dir="ltr">{reference}</span>
      </p>

      <dl className="mt-5 divide-y divide-black/5 rounded-2xl bg-paper p-4 text-start">
        <Row label={c.product} value={product.title} />
        {variant && <Row label={product.variantLabel ?? t.form.variant} value={variant} />}
        <Row label={c.quantity} value={`× ${quantity}`} />
        <Row label={c.subtotal} value={formatDZD(subtotal)} />
        <Row
          label={c.shipping(deliveryLabel(delivery, t))}
          value={shipping !== null ? formatDZD(shipping) : '—'}
        />
        <Row label={c.destination} value={`${wilaya?.code} ${wilaya?.name}`} />
        <Row label={c.address} value={order.address ?? ''} />
        <div className="flex items-center justify-between pt-3">
          <dt className="font-bold text-charcoal">{c.totalToPay}</dt>
          <dd className="text-xl font-extrabold text-primary">{formatDZD(total)}</dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-charcoal/60">
        {c.cashNote}{' '}
        <a href={`tel:${store.phoneTel}`} dir="ltr" className="font-bold text-charcoal underline">
          {store.phoneDisplay}
        </a>
      </p>

      <div className="mt-5 grid gap-2.5">
        <a
          href={HOME_HREF}
          className="grid h-12 place-items-center rounded-xl bg-primary font-bold text-white hover:bg-primary/90"
        >
          {c.continueShopping}
        </a>
        <button
          type="button"
          onClick={onEdit}
          className="h-12 rounded-xl border border-charcoal/15 bg-white text-sm font-bold text-charcoal hover:border-primary hover:text-primary"
        >
          {c.newOrder}
        </button>
      </div>
    </div>
  )
}
