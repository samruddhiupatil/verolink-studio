import { NavLink, Outlet } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { classNames } from '../components/ui/classNames'
import { SegmentedToggle } from '../components/ui/SegmentedToggle'
import styles from './AppShell.module.css'
import { useAppState } from './AppStateContext'
import { ROUTES } from './routeConfig'

export function AppShell() {
  const { state, dispatch } = useAppState()

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandName}>VeroLink Studio</div>
          <div className={styles.brandSub}>Connector Builder</div>
        </div>
        <nav className={styles.nav}>
          {ROUTES.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              end={route.path === '/'}
              className={({ isActive }) => classNames(styles.navLink, isActive && styles.navLinkActive)}
            >
              {route.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className={styles.main}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <span className={styles.connectorName}>{state.connector.name || 'Untitled Connector'}</span>
            {/* Persistent environment badge — visible on every section, per spec. */}
            <Badge tone={state.connector.environment === 'Production' ? 'production' : 'sandbox'}>
              {state.connector.environment}
            </Badge>
          </div>
          <div className={styles.topBarRight}>
            <div className={styles.viewModeGroup}>
              <span className={styles.viewModeLabel}>View</span>
              <SegmentedToggle
                ariaLabel="Admin or user view"
                value={state.ui.viewMode}
                onChange={(value) => dispatch({ type: 'SET_VIEW_MODE', payload: value })}
                options={[
                  { value: 'admin', label: 'Admin' },
                  { value: 'user', label: 'User' },
                ]}
              />
            </div>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
