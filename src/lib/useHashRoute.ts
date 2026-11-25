import { useSyncExternalStore } from 'react'

export type AdminView = { view: 'inventory' } | { view: 'add' } | { view: 'edit'; id: string }

export type Route =
  | { name: 'home' }
  | { name: 'product'; id: string; scrollToOrder: boolean }
  | ({ name: 'admin' } & AdminView)

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}
const getHash = () => window.location.hash

/** Product page: #/product/<id>  — jump straight to the order form: #/product/<id>/order */
export const productHref = (id: string, toOrder = false) =>
  `#/product/${encodeURIComponent(id)}${toOrder ? '/order' : ''}`

export const HOME_HREF = '#/'

/** Admin dashboard: #/admin (inventory) · #/admin/add · #/admin/edit/<id> */
export const ADMIN_HREF = '#/admin'
export const ADMIN_ADD_HREF = '#/admin/add'
export const adminEditHref = (id: string) => `#/admin/edit/${encodeURIComponent(id)}`

/** Lets `/admin` (a real path) open the hash-routed dashboard. Call once before the first render. */
export function redirectAdminPath() {
  const { pathname, hash } = window.location
  if (/^\/admin\/?$/.test(pathname)) {
    window.history.replaceState(null, '', `/${hash || ADMIN_HREF}`)
  }
}

export function parseHash(hash: string): Route {
  const [, section, id, flag] = hash.replace(/^#/, '').split('/')
  if (section === 'product' && id) {
    return { name: 'product', id: decodeURIComponent(id), scrollToOrder: flag === 'order' }
  }
  if (section === 'admin') {
    if (id === 'add') return { name: 'admin', view: 'add' }
    if (id === 'edit' && flag) return { name: 'admin', view: 'edit', id: decodeURIComponent(flag) }
    return { name: 'admin', view: 'inventory' }
  }
  return { name: 'home' }
}

export function useHashRoute(): { route: Route; hash: string } {
  const hash = useSyncExternalStore(subscribe, getHash, () => '')
  return { route: parseHash(hash), hash }
}
