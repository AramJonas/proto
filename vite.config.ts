import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import productImages from './vite-plugin-product-images.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), productImages()],
})
