import { CheckIcon } from './Icons'

/** Confirmation toast. Sits above the call pill (bottom-24) so they never overlap. */
export default function Toast({ message }: { message: string | null }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4"
    >
      {message && (
        <div className="flex max-w-sm items-start gap-2.5 rounded-2xl bg-charcoal px-4 py-3 text-sm font-medium text-white shadow-xl ring-1 ring-white/10">
          <CheckIcon className="mt-0.5 size-5 shrink-0 text-primary" />
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}
