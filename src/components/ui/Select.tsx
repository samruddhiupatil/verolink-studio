import type { SelectHTMLAttributes } from 'react'
import { classNames } from './classNames'
import styles from './controls.module.css'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={classNames(styles.control, className)} {...props}>
      {children}
    </select>
  )
}
