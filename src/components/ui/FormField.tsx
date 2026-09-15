import type { ReactNode } from 'react'
import styles from './FormField.module.css'

interface FormFieldProps {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

export function FormField({ label, htmlFor, required, error, hint, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
        {required && <span className={styles.required}> *</span>}
      </label>
      {children}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        hint && <p className={styles.hint}>{hint}</p>
      )}
    </div>
  )
}
