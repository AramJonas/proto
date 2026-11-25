# Moulinaxx — storefront prototype

Mobile-first React + Tailwind CSS v4 (Vite, TypeScript) COD storefront for the Algerian market (prices in د.ج).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Replace the mock data

All products, categories, store info (phone, WhatsApp, social links) and the 58 Wilaya shipping
rates live in **`src/mockData.ts`**. Keep the exported types and swap the constants for backend data.

- Phone / WhatsApp: `store.phoneTel`, `store.phoneDisplay`, `store.whatsappNumber` (digits only, e.g. `213555123456`).
- Social links: `store.social.*`.
- Product photos: drop `.jpg` files in `src/assets/products/images/` and list them on a product with
  `images: photos('05-1', '05-2')` (file `product-05-1.jpg` → `'05-1'`, first = cover). Several photos
  give a thumbnail gallery on the product page; with no `images`, an SVG icon placeholder (`icon` in `SEED_EXTRAS`) is shown.
- Photos added from the admin form (`npm run dev`) are saved as real files in
  `public/images/products/` (served at `/images/products/…`; commit them with the project). In a
  static/production build there is no upload endpoint, so photos fall back to browser localStorage.
- A product shows "Promo !" automatically when `oldPrice > price`.

## Palette (`src/index.css`)

| Token | Hex | Use |
| --- | --- | --- |
| `primary` | `#F36B0B` | CTAs, Promo badges, active states, prices |
| `charcoal` | `#252525` | announcement bar, headings, footer, call pill |
| `white` | `#FFFFFF` | header, cards, order form, menu |
| `paper` | `#F7F7F7` | page background, image frames |

## Routes (hash-based)

- `#/` storefront
- `#/product/<id>` product detail + COD form
- `#/product/<id>/order` same, scrolled to the form (used by the card "Commander" button)
