import { lazy, Suspense, useCallback, useState } from 'react'
import CallPill from './components/CallPill'
import Header from './components/Header'
import MenuDrawer, { type CategoryFilter } from './components/MenuDrawer'
import ProductPage from './components/ProductPage'
import { AnnouncementBar, Footer } from './components/Sections'
import Storefront from './components/Storefront'
import Toast from './components/Toast'
import { useLang } from './i18n/langContext'
import { HOME_HREF, useHashRoute } from './lib/useHashRoute'
import { useToast } from './lib/useToast'

// The dashboard is a separate chunk: storefront visitors never download it.
const AdminApp = lazy(() => import('./components/admin/AdminApp'))

export default function App() {
  const { route } = useHashRoute()
  const { catalog } = useLang()
  const { products } = catalog
  const [menuOpen, setMenuOpen] = useState(false)
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const [query, setQuery] = useState('')
  const toast = useToast()

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  // Changing category / searching always returns to the storefront grid.
  const goHome = () => {
    if (route.name !== 'home') window.location.hash = HOME_HREF
  }
  const selectFilter = (f: CategoryFilter) => {
    setFilter(f)
    setMenuOpen(false)
    goHome()
  }
  const changeQuery = (q: string) => {
    setQuery(q)
    if (q) goHome()
  }

  if (route.name === 'admin') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-paper" />}>
        <AdminApp route={route} />
      </Suspense>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <AnnouncementBar />
      <Header query={query} onQuery={changeQuery} onOpenMenu={() => setMenuOpen(true)} />
      <MenuDrawer open={menuOpen} onClose={closeMenu} active={filter} onSelect={selectFilter} />

      <main>
        {route.name === 'product' ? (
          <ProductPage
            product={products.find((p) => p.id === route.id)}
            scrollToOrder={route.scrollToOrder}
            onToast={toast.show}
          />
        ) : (
          <Storefront filter={filter} onFilter={selectFilter} query={query} />
        )}
      </main>

      <Footer />
      <Toast message={toast.message} />
      <CallPill />
    </div>
  )
}
