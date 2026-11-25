import type { ReactNode } from 'react'
import { useLang } from '../i18n/langContext'
import { buildOrderText, copyToClipboard, whatsappLink, type OrderSnapshot } from '../lib/format'
import { store } from '../mockData'
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from './Icons'

interface Props {
  order: OrderSnapshot
  onToast: (message: string) => void
}

const btn =
  'flex h-12 items-center justify-center gap-2 rounded-xl border border-charcoal/15 bg-white text-sm font-bold text-charcoal transition-colors hover:border-primary hover:text-primary active:scale-[0.98]'

/**
 * Secondary order channels, rendered directly under the COD submit button.
 * - WhatsApp: wa.me deep-link pre-filled with product, variant, qty and total.
 * - Instagram / Facebook / TikTok: copy the formatted order + toast + open the store profile.
 */
export default function SocialOrderButtons({ order, onToast }: Props) {
  const { t } = useLang()
  const text = buildOrderText(order, t)

  const copyAndOpen = (label: string, url: string) => {
    // Start the copy and open the tab inside the same click so popup blockers allow it.
    const copied = copyToClipboard(text)
    window.open(url, '_blank', 'noopener,noreferrer')
    void copied.then((ok) =>
      onToast(ok ? t.social.copied(label) : t.social.copyFailed(label)),
    )
  }

  const channels: { label: string; url: string; icon: ReactNode }[] = [
    { label: 'Instagram', url: store.social.instagram, icon: <InstagramIcon className="size-5" /> },
    { label: 'Facebook', url: store.social.facebook, icon: <FacebookIcon className="size-5" /> },
    { label: 'TikTok', url: store.social.tiktok, icon: <TikTokIcon className="size-5" /> },
  ]

  return (
    <section aria-labelledby="social-order-title" className="mt-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px flex-1 bg-charcoal/10" />
        <h3 id="social-order-title" className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
          {t.social.orderVia}
        </h3>
        <span className="h-px flex-1 bg-charcoal/10" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <a
          href={whatsappLink(text)}
          target="_blank"
          rel="noopener noreferrer"
          className={btn}
        >
          <WhatsAppIcon className="size-5" />
          WhatsApp
        </a>
        {channels.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => copyAndOpen(c.label, c.url)}
            className={btn}
          >
            {c.icon}
            {c.label}
          </button>
        ))}
      </div>
      <p className="mt-2.5 text-center text-xs text-charcoal/60">{t.social.note}</p>
    </section>
  )
}
