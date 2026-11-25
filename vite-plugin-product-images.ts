import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { Plugin } from 'vite'

/** Route called by the admin form (src/lib/imageFile.ts → saveImageToProject). */
export const UPLOAD_ROUTE = '/__api/product-images'

/** Folder (relative to the project root) where new product pictures are written. */
const TARGET_DIR = path.join('public', 'images', 'products')
/** Public URL prefix matching TARGET_DIR (everything in /public is served from the site root). */
const PUBLIC_PREFIX = '/images/products'

const MAX_BYTES = 15 * 1024 * 1024

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

/**
 * Dev-server only: lets the admin dashboard save newly added product pictures as real files in
 * `public/images/products/` instead of keeping them as data-URLs in the browser's localStorage.
 *
 * POST { "dataUrl": "data:image/jpeg;base64,…" }  →  { "url": "/images/products/product-….jpg" }
 */
export default function productImages(): Plugin {
  return {
    name: 'moulinaxx-product-images',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root

      server.middlewares.use(UPLOAD_ROUTE, (req, res) => {
        const send = (status: number, body: Record<string, string>) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (req.method !== 'POST') return send(405, { error: 'Method not allowed' })

        const chunks: Buffer[] = []
        let size = 0
        let aborted = false

        req.on('data', (chunk: Buffer) => {
          size += chunk.length
          if (size > MAX_BYTES * 1.4) {
            aborted = true
            send(413, { error: 'Image too large' })
            req.destroy()
            return
          }
          chunks.push(chunk)
        })

        req.on('end', () => {
          if (aborted) return
          void (async () => {
            try {
              const { dataUrl } = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
                dataUrl?: unknown
              }
              const match =
                typeof dataUrl === 'string'
                  ? /^data:(image\/[a-z]+);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl)
                  : null
              const ext = match ? EXTENSIONS[match[1]] : undefined
              if (!match || !ext) return send(400, { error: 'Unsupported image' })

              const bytes = Buffer.from(match[2], 'base64')
              if (bytes.length === 0 || bytes.length > MAX_BYTES) {
                return send(400, { error: 'Invalid image size' })
              }

              const fileName = `product-${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`
              const dir = path.join(root, TARGET_DIR)
              await mkdir(dir, { recursive: true })
              await writeFile(path.join(dir, fileName), bytes)
              send(200, { url: `${PUBLIC_PREFIX}/${fileName}` })
            } catch {
              send(400, { error: 'Invalid request' })
            }
          })()
        })
      })
    },
  }
}
