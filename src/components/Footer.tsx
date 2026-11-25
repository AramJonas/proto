import { useLang } from '../i18n/langContext'
import Logo from './Logo'

export default function Footer() {
  const { t, catalog } = useLang()
  const { store } = catalog
  return (
    <footer className="mt-12 bg-charcoal pb-24 pt-10 text-white">
      <div className="page-container grid gap-8 sm:grid-cols-3">
        <div>
          <span className="inline-block rounded-xl bg-white px-3 py-2">
            <Logo className="h-8" alt={store.name} />
          </span>
          <p className="mt-2 text-sm text-white/70">{store.tagline}</p>
        </div>
        <div className="text-sm text-white/80">
          <p className="mb-2 font-bold text-white">{t.footer.contact}</p>
          <p>
            <a href={`tel:${store.phoneTel}`} dir="ltr" className="hover:text-primary">
              {store.phoneDisplay}
            </a>
          </p>
          <p>{store.email}</p>
          <p>{store.address}</p>
        </div>
        <div className="text-sm text-white/80">
          <p className="mb-2 font-bold text-white">{t.footer.followUs}</p>
          <ul className="space-y-1">
            <li><a href={store.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Instagram</a></li>
            <li><a href={store.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary">Facebook</a></li>
            <li><a href={store.social.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-primary">TikTok</a></li>
          </ul>
        </div>
      </div>
      <div className="page-container">
        <p className="mt-8 border-t border-white/10 pt-4 text-xs text-white/50">
          {t.footer.prototype(new Date().getFullYear(), store.name)}
        </p>
      </div>
    </footer>
  )
}
