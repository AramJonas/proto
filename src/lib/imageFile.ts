/** Browser-side helpers for product photos chosen in the admin form. */

const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_SIDE = 900
const JPEG_QUALITY = 0.82

const readAsDataURL = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('read error'))
    reader.readAsDataURL(file)
  })

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('decode error'))
    img.src = src
  })

/**
 * Reads a local image file into a data-URL preview. The picture is downscaled (longest side
 * 900 px) and re-encoded as JPEG so several photos per product fit in localStorage.
 * Rejects with a French, user-facing message.
 */
export async function fileToPreview(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error(`« ${file.name} » n'est pas une image.`)
  if (file.size > MAX_FILE_BYTES) throw new Error(`« ${file.name} » dépasse 10 Mo.`)

  const original = await readAsDataURL(file)
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') return original
  try {
    const img = await loadImage(original)
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) return original
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  } catch {
    return original
  }
}

/** Accepts http(s) links, root-relative paths and data-URL images. */
export function isValidImageUrl(value: string): boolean {
  const v = value.trim()
  if (/^data:image\//i.test(v)) return true
  if (v.startsWith('/') && !v.startsWith('//')) return true
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
