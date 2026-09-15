import type { TextareaHTMLAttributes } from 'react'
import { classNames } from './classNames'
import styles from './controls.module.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean
  mono?: boolean
}

export function Textarea({ hasError, mono, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={classNames(styles.control, hasError && styles.controlError, mono && styles.mono, className)}
      {...props}
    />
  )
}
