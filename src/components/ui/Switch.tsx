import styles from './Switch.module.css'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  id?: string
}

export function Switch({ checked, onChange, label, id }: SwitchProps) {
  return (
    <label className={styles.label} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={styles.input}
      />
      <span className={styles.track}>
        <span className={styles.thumb} />
      </span>
      {label && <span className={styles.text}>{label}</span>}
    </label>
  )
}
