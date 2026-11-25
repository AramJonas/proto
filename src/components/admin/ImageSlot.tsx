import { useId, useRef, useState, type DragEvent } from 'react'
import { ImagePlus, Link2, Trash2, Upload } from 'lucide-react'
import { fileToPreview, isValidImageUrl } from '../../lib/imageFile'
import { inputCls, inputErrCls } from './adminStyles'

interface Props {
  index: number
  /** Image URL / data-URL, or '' when the slot is empty. */
  value: string
  onChange: (value: string) => void
}

const smallBtn =
  'inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-black/15 bg-white px-2 text-xs font-bold text-charcoal transition-colors hover:border-primary hover:text-primary'

/** One of the 5 photo slots: local file (FileReader preview) or image URL, with replace / delete. */
export default function ImageSlot({ index, value, onChange }: Props) {
  const uid = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  const [urlOpen, setUrlOpen] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null)

  const isMain = index === 0
  const label = isMain ? 'Image principale' : `Image ${index + 1}`
  const broken = value !== '' && brokenSrc === value

  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await fileToPreview(file))
      setUrlOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Image illisible.')
    } finally {
      setBusy(false)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    void pick(e.dataTransfer.files[0])
  }

  const applyUrl = () => {
    const url = urlDraft.trim()
    if (!isValidImageUrl(url)) {
      setError('Entrez un lien valide (https://…).')
      return
    }
    setError('')
    onChange(url)
    setUrlOpen(false)
    setUrlDraft('')
  }

  const remove = () => {
    onChange('')
    setError('')
    setUrlOpen(false)
    setUrlDraft('')
  }

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative grid aspect-square place-items-center overflow-hidden rounded-xl border-2 border-dashed bg-paper transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : value ? 'border-transparent' : 'border-black/15'
        }`}
      >
        {value && !broken ? (
          <img
            src={value}
            alt={label}
            onError={() => setBrokenSrc(value)}
            className="size-full object-cover"
          />
        ) : (
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            className="flex size-full flex-col items-center justify-center gap-1 px-2 text-center text-charcoal/50 hover:text-primary"
          >
            <ImagePlus className="size-7" aria-hidden />
            <span className="text-xs font-semibold">
              {busy ? 'Chargement…' : broken ? 'Image introuvable' : 'Ajouter'}
            </span>
          </button>
        )}
        <span
          className={`pointer-events-none absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[11px] font-extrabold shadow-sm ${
            isMain ? 'bg-primary text-white' : 'bg-charcoal/80 text-white'
          }`}
        >
          {isMain ? 'Image principale' : `#${index + 1}`}
        </span>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label={`${label} — choisir un fichier`}
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          void pick(file)
        }}
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
          className={smallBtn}
          aria-label={value ? `${label} — remplacer` : `${label} — importer`}
        >
          <Upload className="size-3.5" aria-hidden />
          {value ? 'Remplacer' : 'Importer'}
        </button>
        <button
          type="button"
          onClick={() => {
            setUrlOpen((v) => !v)
            setError('')
            setUrlDraft(value.startsWith('http') ? value : '')
          }}
          aria-expanded={urlOpen}
          aria-controls={`${uid}-url`}
          className={smallBtn}
          aria-label={`${label} — utiliser un lien`}
        >
          <Link2 className="size-3.5" aria-hidden />
          Lien
        </button>
        {value && (
          <button
            type="button"
            onClick={remove}
            className={`${smallBtn} hover:border-red-500 hover:text-red-600`}
            aria-label={`${label} — supprimer`}
          >
            <Trash2 className="size-3.5" aria-hidden />
            Supprimer
          </button>
        )}
      </div>

      {urlOpen && (
        <div id={`${uid}-url`} className="flex gap-1.5">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                applyUrl()
              }
            }}
            placeholder="https://…"
            aria-label={`${label} — lien de l'image`}
            className={`${inputCls} h-9 min-w-0 flex-1 text-xs ${error ? inputErrCls : ''}`}
          />
          <button
            type="button"
            onClick={applyUrl}
            className="h-9 shrink-0 rounded-lg bg-primary px-3 text-xs font-bold text-white hover:bg-primary/90"
          >
            OK
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
