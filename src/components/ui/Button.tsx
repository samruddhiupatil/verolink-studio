import type { ButtonHTMLAttributes } from 'react'
import { classNames } from './classNames'
import styles from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'sm'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({ variant = 'secondary', size = 'md', className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(styles.button, styles[variant], size === 'sm' && styles.sm, className)}
      {...props}
    />
  )
}
