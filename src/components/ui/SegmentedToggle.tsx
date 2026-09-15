import { classNames } from './classNames'
import styles from './SegmentedToggle.module.css'

export interface SegmentedToggleOption<T extends string> {
  value: T
  label: string
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedToggleOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel: string
}

export function SegmentedToggle<T extends string>({ options, value, onChange, ariaLabel }: SegmentedToggleProps<T>) {
  return (
    <div className={styles.group} role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          className={classNames(styles.segment, option.value === value && styles.active)}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
