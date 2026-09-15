import type { InputHTMLAttributes } from 'react'
import { classNames } from './classNames'
import styles from './controls.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
  mono?: boolean
}

export function Input({ hasError, mono, className, ...props }: InputProps) {
  return (
    <input
      className={classNames(styles.control, hasError && styles.controlError, mono && styles.mono, className)}
      {...props}
    />
  )
}
