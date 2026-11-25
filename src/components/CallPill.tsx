import { useLang } from '../i18n/langContext'
import { store } from '../mockData'
import { PhoneIcon } from './Icons'

/** Icon-only floating call button — fixed at the bottom end corner. */
export default function CallPill() {
  const { t } = useLang()

  return (
    <a
      href={`tel:${store.phoneTel}`}
      aria-label={t.call.callNumber(store.phoneDisplay)}
      title={t.call.label}
      className="fixed bottom-4 end-4 z-50 grid size-12 place-items-center rounded-full bg-charcoal text-primary shadow-xl ring-1 ring-white/10 transition-opacity hover:opacity-90"
    >
      <PhoneIcon className="size-6" />
    </a>
  )
}
