import { formatDZD } from '../lib/format'

interface Props {
  price: number
  oldPrice?: number
  size?: 'md' | 'lg'
}

/** Strikethrough old price + bold orange current price, both in DA. */
export default function PriceTag({ price, oldPrice, size = 'md' }: Props) {
  const hasPromo = oldPrice !== undefined && oldPrice > price
  const pct = hasPromo ? Math.round((1 - price / oldPrice) * 100) : 0
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span
        className={`font-extrabold ${size === 'lg' ? 'text-2xl text-primary' : 'text-base text-[#111827]'}`}
      >
        {formatDZD(price)}
      </span>
      {hasPromo && (
        <>
          <del
            className={`font-medium text-gray-400 ${size === 'lg' ? 'text-base' : 'text-xs'}`}
          >
            <span className="sr-only">Ancien prix : </span>
            {formatDZD(oldPrice)}
          </del>
          {pct > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold leading-none text-primary">
              -{pct}%
            </span>
          )}
        </>
      )}
    </div>
  )
}
