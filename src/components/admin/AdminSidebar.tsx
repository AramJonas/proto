import type { ReactNode } from 'react'
import { LayoutDashboard, PlusCircle, Store } from 'lucide-react'
import { ADMIN_ADD_HREF, ADMIN_HREF, HOME_HREF } from '../../lib/useHashRoute'
import Logo from '../Logo'

function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string
  active: boolean
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <a
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 text-sm font-bold transition-colors ${
        active ? 'bg-primary text-white' : 'text-white/75 hover:bg-white/10 hover:text-white'
      }`}
    >
      {icon}
      {children}
    </a>
  )
}

/** Charcoal sidebar (becomes a top bar with a swipeable nav row below `lg`). */
export default function AdminSidebar({ view }: { view: 'inventory' | 'add' | 'edit' }) {
  return (
    <aside className="bg-charcoal text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
      <a
        href={ADMIN_HREF}
        aria-label="MoulinaxxBatna — administration"
        className="block bg-white px-4 py-3 lg:px-5 lg:py-5"
      >
        <Logo className="h-8 lg:h-9" />
        <span className="hidden text-xs font-bold uppercase tracking-wider text-charcoal/50 lg:block">
          Administration
        </span>
      </a>

      <nav
        aria-label="Navigation administration"
        className="no-scrollbar flex gap-2 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:overflow-visible lg:pt-5"
      >
        <NavLink
          href={ADMIN_HREF}
          active={view === 'inventory' || view === 'edit'}
          icon={<LayoutDashboard className="size-5" aria-hidden />}
        >
          Inventaire / Produits
        </NavLink>
        <NavLink
          href={ADMIN_ADD_HREF}
          active={view === 'add'}
          icon={<PlusCircle className="size-5" aria-hidden />}
        >
          Ajouter un produit
        </NavLink>
        <a
          href={HOME_HREF}
          className="flex h-11 shrink-0 items-center gap-3 whitespace-nowrap rounded-xl border border-white/20 px-3.5 text-sm font-bold text-white transition-colors hover:border-primary hover:bg-primary lg:mt-auto"
        >
          <Store className="size-5" aria-hidden />
          Voir la boutique
        </a>
      </nav>

      <p className="hidden px-5 pb-5 text-xs text-white/40 lg:block">
        Les modifications apparaissent immédiatement sur la boutique.
      </p>
    </aside>
  )
}
