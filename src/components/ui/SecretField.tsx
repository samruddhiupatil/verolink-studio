import { useId, useState } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import styles from './SecretField.module.css'

interface SecretFieldProps {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  hasError?: boolean
}

/** Masked by default, per-field show/hide toggle — spec requirement for every secret/credential field. */
export function SecretField({ id, value, onChange, placeholder, hasError }: SecretFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const [visible, setVisible] = useState(false)

  return (
    <div className={styles.wrapper}>
      <Input
        id={fieldId}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        hasError={hasError}
        mono
        autoComplete="off"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide value' : 'Show value'}
      >
        {visible ? 'Hide' : 'Show'}
      </Button>
    </div>
  )
}
