import { useState } from 'react'
import { useLang } from '../i18n/langContext'
import { store } from '../mockData'
import { CloseIcon, PhoneIcon } from './Icons'

/** Compact, dismissible floating call notification — fixed at the bottom end corner. */
export default function CallPill() {
  const { t } = useLang()
  const [open, setOpen] = useState(true)
  if (!open) return null

  return (
    <div
      role="complementary"
      aria-label={t.call.aria}
      className="fixed bottom-4 end-4 z-50 flex items-center rounded-full bg-charcoal p-1.5 text-white shadow-xl ring-1 ring-white/10"
    >
      <a
        href={`tel:${store.phoneTel}`}
        aria-label={t.call.callNumber(store.phoneDisplay)}
        className="flex items-center gap-2.5 rounded-full pe-2 transition-opacity hover:opacity-90"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-primary">
          <PhoneIcon className="size-5" />
        </span>
        <span className="leading-tight">
          <span className="block text-[11px] text-white/60">{t.call.label}</span>
          <span dir="ltr" className="block text-sm font-bold tracking-wide">
            {store.phoneDisplay}
          </span>
        </span>
      </a>
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label={t.call.close}
        className="grid size-8 shrink-0 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <CloseIcon className="size-4" />
      </button>
    </div>
  )
}
