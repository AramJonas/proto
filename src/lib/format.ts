import type { Dict } from '../i18n/fr'
import { store, type Product, type Wilaya } from '../mockData'

export type DeliveryType = 'home' | 'desk'

/** 3 500 → "3 500 DA" (non-breaking spaces so the amount never wraps). Plain text, for messages. */
export function formatDZDPlain(amount: number): string {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
  return `${grouped}\u00A0DA`
}

/**
 * Same amount for on-screen display, wrapped in a Left-to-Right Isolate (U+2066 … U+2069) so the
 * amount can never be reordered next to Arabic text (e.g. old price next to current price).
 */
export function formatDZD(amount: number): string {
  return `\u2066${formatDZDPlain(amount)}\u2069`
}

/** 24500 → "24 500 DA" (admin dashboard). */
export function formatDA(amount: number): string {
  return `${Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')}\u00A0DA`
}

export function discountPercent(product: Product): number {
  if (!product.oldPrice || product.oldPrice <= product.price) return 0
  return Math.round((1 - product.price / product.oldPrice) * 100)
}

export function isPromo(product: Product): boolean {
  return discountPercent(product) > 0
}

export function shippingRate(wilaya: Wilaya | undefined, delivery: DeliveryType): number | null {
  if (!wilaya) return null
  return delivery === 'home' ? wilaya.homeRate : wilaya.deskRate
}

export const deliveryLabel = (d: DeliveryType, t: Dict) =>
  d === 'home' ? t.delivery.home : t.delivery.desk

/** Accepts 0555 12 34 56, 05-55-12-34-56, +213 555 12 34 56, 00213555123456. */
export function normalizePhone(raw: string): string {
  let p = raw.replace(/[\s.\-()]/g, '')
  if (p.startsWith('+213')) p = '0' + p.slice(4)
  else if (p.startsWith('00213')) p = '0' + p.slice(5)
  return p
}

export const isValidAlgerianMobile = (raw: string) => /^0[567]\d{8}$/.test(normalizePhone(raw))

/** Remove accents + lowercase, for forgiving search (Arabic diacritics and tatweel are dropped too). */
export const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f\u064B-\u065F\u0640]/g, '')
    .toLowerCase()

export interface OrderSnapshot {
  product: Product
  variant?: string
  quantity: number
  wilaya?: Wilaya
  delivery: DeliveryType
  shipping: number | null
  subtotal: number
  total: number
  fullName?: string
  phone?: string
  address?: string
}

/** Human-readable order text (in the active language), used for WhatsApp and the clipboard. */
export function buildOrderText(o: OrderSnapshot, t: Dict): string {
  const x = t.orderText
  const lines = [x.heading(store.name), '', `${x.product} : ${o.product.title}`]
  if (o.variant) lines.push(`${o.product.variantLabel ?? x.variant} : ${o.variant}`)
  lines.push(`${x.quantity} : ${o.quantity}`, `${x.unitPrice} : ${formatDZDPlain(o.product.price)}`)
  if (o.wilaya && o.shipping !== null) {
    lines.push(
      `${x.delivery} : ${deliveryLabel(o.delivery, t)} — ${o.wilaya.code} ${o.wilaya.name} (${formatDZDPlain(o.shipping)})`,
    )
  }
  lines.push(
    `${x.total} : ${formatDZDPlain(o.total)}${o.shipping === null ? x.excludingShipping : ''}`,
  )
  const customer: string[] = []
  if (o.fullName?.trim()) customer.push(`${x.name} : ${o.fullName.trim()}`)
  if (o.phone?.trim()) customer.push(`${x.phone} : ${o.phone.trim()}`)
  if (o.address?.trim()) customer.push(`${x.address} : ${o.address.trim()}`)
  if (customer.length) lines.push('', ...customer)
  return lines.join('\n')
}

export const whatsappLink = (text: string) =>
  `https://wa.me/${store.whatsappNumber}?text=${encodeURIComponent(text)}`

/** Clipboard write with a fallback for non-secure contexts / older mobile browsers. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
