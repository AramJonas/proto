import { useId, useMemo, useState, type FormEvent } from 'react'
import { useLang } from '../i18n/langContext'
import {
  formatDZD,
  isValidAlgerianMobile,
  shippingRate,
  type DeliveryType,
  type OrderSnapshot,
} from '../lib/format'
import { fieldId, type CustomerErrors } from '../lib/formHelpers'
import type { Product } from '../mockData'
import { CustomerFields, WilayaSelect } from './CustomerFields'
import { DeliveryToggle, TotalBox } from './DeliveryAndTotal'
import OrderConfirmation from './OrderConfirmation'
import { BoundProduct, QuantityStepper, VariantPicker } from './OrderFields'
import SocialOrderButtons from './SocialOrderButtons'

interface Props {
  product: Product
  onToast: (message: string) => void
}

/** COD order form, pre-bound to exactly one product. Remounted (via key) when the product changes. */
export default function OrderForm({ product, onToast }: Props) {
  const uid = useId()
  const { t, catalog } = useLang()
  // Variant is tracked by index so it stays valid when the language (and its labels) changes.
  const [variantIndex, setVariantIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [wilayaCode, setWilayaCode] = useState('')
  const [delivery, setDelivery] = useState<DeliveryType>('home')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [errors, setErrors] = useState<CustomerErrors>({})
  const [confirmed, setConfirmed] = useState<{ order: OrderSnapshot; reference: string } | null>(
    null,
  )

  const variant = product.variants?.[variantIndex]
  const wilaya = catalog.wilayas.find((w) => w.code === wilayaCode)
  const shipping = shippingRate(wilaya, delivery)

  const order: OrderSnapshot = useMemo(() => {
    const subtotal = product.price * quantity
    return {
      product,
      variant,
      quantity,
      wilaya,
      delivery,
      shipping,
      subtotal,
      total: subtotal + (shipping ?? 0),
      fullName,
      phone,
      address,
    }
  }, [product, variant, quantity, wilaya, delivery, shipping, fullName, phone, address])

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    const e: CustomerErrors = {}
    if (!wilaya) e.wilaya = t.form.errors.wilaya
    if (fullName.trim().length < 3) e.fullName = t.form.errors.fullName
    if (!isValidAlgerianMobile(phone)) e.phone = t.form.errors.phone
    if (address.trim().length < 3) e.address = t.form.errors.address
    setErrors(e)
    const first = (Object.keys(e) as (keyof CustomerErrors)[])[0]
    if (first) {
      document.getElementById(fieldId(uid, first))?.focus()
      return
    }
    const reference = `CMD-${Date.now().toString(36).toUpperCase().slice(-6)}`
    setConfirmed({ order, reference })
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const startNewOrder = () => {
    setConfirmed(null)
    setQuantity(1)
    setFullName('')
    setPhone('')
    setAddress('')
    setErrors({})
  }

  return (
    <div id="order" className="scroll-mt-20 p-4 sm:p-6 md:p-6">
      {confirmed ? (
        // Re-derive the snapshot from the current language so the summary follows the switcher.
        <OrderConfirmation order={order} reference={confirmed.reference} onEdit={startNewOrder} />
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <h2 className="text-lg font-extrabold text-charcoal">{t.form.title}</h2>
            <p className="text-sm text-charcoal/60">{t.form.subtitle}</p>
          </div>

          <BoundProduct product={product} />
          <VariantPicker
            product={product}
            value={variant}
            onChange={(v) => setVariantIndex(Math.max(0, product.variants?.indexOf(v) ?? 0))}
          />
          <QuantityStepper value={quantity} onChange={setQuantity} />

          <WilayaSelect uid={uid} value={wilayaCode} error={errors.wilaya} onChange={setWilayaCode} />
          <DeliveryToggle value={delivery} wilaya={wilaya} onChange={setDelivery} />

          <CustomerFields
            uid={uid}
            errors={errors}
            fullName={fullName}
            phone={phone}
            address={address}
            onFullName={setFullName}
            onPhone={setPhone}
            onAddress={setAddress}
          />

          <TotalBox
            unitPrice={product.price}
            quantity={quantity}
            subtotal={order.subtotal}
            wilaya={wilaya}
            shipping={shipping}
            total={order.total}
          />

          <button
            type="submit"
            className="h-14 w-full rounded-xl bg-primary text-base font-extrabold text-white shadow-sm transition-colors hover:bg-primary/90 active:scale-[0.99]"
          >
            {t.form.confirm} · {formatDZD(order.total)}
          </button>

          <SocialOrderButtons order={order} onToast={onToast} />
        </form>
      )}
    </div>
  )
}
