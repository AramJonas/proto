export const MAX_QTY = 10

export const inputCls = (invalid: boolean) =>
  `h-12 w-full rounded-xl border bg-white px-3.5 text-base text-charcoal placeholder:text-charcoal/40 focus:border-primary focus:outline-none ${
    invalid ? 'border-red-500' : 'border-charcoal/15'
  }`

export type CustomerErrors = Partial<Record<'fullName' | 'phone' | 'wilaya' | 'address', string>>

/** DOM id for a field, so the form can focus the first invalid one. */
export const fieldId = (uid: string, name: keyof CustomerErrors) => `${uid}-${name}`
