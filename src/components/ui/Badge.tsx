import type { HTMLAttributes } from 'react'
import { classNames } from './classNames'
import styles from './Badge.module.css'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'sandbox' | 'production'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return <span className={classNames(styles.badge, styles[tone], className)} {...props} />
}
