import { useLang } from '../i18n/langContext'
import { fieldId, inputCls, type CustomerErrors } from '../lib/formHelpers'
import { Field } from './OrderFields'

interface WilayaProps {
  uid: string
  value: string
  error?: string
  onChange: (code: string) => void
}

export function WilayaSelect({ uid, value, error, onChange }: WilayaProps) {
  const { t, catalog } = useLang()
  return (
    <Field label={t.form.wilaya} htmlFor={fieldId(uid, 'wilaya')} error={error}>
      <select
        id={fieldId(uid, 'wilaya')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={inputCls(!!error)}
      >
        <option value="">{t.form.wilayaPlaceholder}</option>
        {catalog.wilayas.map((w) => (
          <option key={w.code} value={w.code}>
            {w.code} - {w.name}
          </option>
        ))}
      </select>
    </Field>
  )
}

interface CustomerProps {
  uid: string
  errors: CustomerErrors
  fullName: string
  phone: string
  address: string
  onFullName: (v: string) => void
  onPhone: (v: string) => void
  onAddress: (v: string) => void
}

export function CustomerFields(p: CustomerProps) {
  const { t } = useLang()
  return (
    <>
      <Field label={t.form.fullName} htmlFor={fieldId(p.uid, 'fullName')} error={p.errors.fullName}>
        <input
          id={fieldId(p.uid, 'fullName')}
          type="text"
          autoComplete="name"
          value={p.fullName}
          onChange={(e) => p.onFullName(e.target.value)}
          placeholder={t.form.fullNamePlaceholder}
          aria-invalid={!!p.errors.fullName}
          className={inputCls(!!p.errors.fullName)}
        />
      </Field>
      <Field label={t.form.phone} htmlFor={fieldId(p.uid, 'phone')} error={p.errors.phone}>
        <input
          id={fieldId(p.uid, 'phone')}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          value={p.phone}
          onChange={(e) => p.onPhone(e.target.value)}
          placeholder={t.form.phonePlaceholder}
          aria-invalid={!!p.errors.phone}
          className={`${inputCls(!!p.errors.phone)} text-start rtl:text-right`}
        />
      </Field>
      <Field label={t.form.address} htmlFor={fieldId(p.uid, 'address')} error={p.errors.address}>
        <input
          id={fieldId(p.uid, 'address')}
          type="text"
          autoComplete="street-address"
          value={p.address}
          onChange={(e) => p.onAddress(e.target.value)}
          placeholder={t.form.addressPlaceholder}
          aria-invalid={!!p.errors.address}
          className={inputCls(!!p.errors.address)}
        />
      </Field>
    </>
  )
}
