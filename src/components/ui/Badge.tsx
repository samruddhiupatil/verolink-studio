import type { ReactNode } from 'react'
import { classNames } from './classNames'
import styles from './Badge.module.css'

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'sandbox' | 'production'

export function Badge({ tone = 'neutral', className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return <span className={classNames(styles.badge, styles[tone], className)}>{children}</span>
}
