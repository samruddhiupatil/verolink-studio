import type { ReactNode } from 'react'
import { classNames } from './classNames'
import styles from './Panel.module.css'

interface PanelProps {
  title?: string
  subtitle?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Panel({ title, subtitle, actions, children, className }: PanelProps) {
  return (
    <section className={classNames(styles.panel, className)}>
      {(title || actions) && (
        <header className={styles.header}>
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  )
}
