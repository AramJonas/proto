/** Store logo (icon + wordmark). To use a different file, drop it in /public and change this path. */
export const LOGO_SRC = '/logo.svg'

/** The logo is a Latin brand mark: it is never mirrored in the Arabic layout. */
export default function Logo({ className = '', alt = '' }: { className?: string; alt?: string }) {
  return <img src={LOGO_SRC} alt={alt} draggable={false} className={`block w-auto ${className}`} />
}
