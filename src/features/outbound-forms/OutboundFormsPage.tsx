import { useAppState } from '../../app/AppStateContext'
import { OutboundFormBuilderPage } from './builder/OutboundFormBuilderPage'
import { OutboundMappingPage } from './mapping/OutboundMappingPage'
import styles from './OutboundFormsPage.module.css'
import { OutboundFormUser } from './runtime/OutboundFormUser'

/** Section 6 — Admin View shows Parts A+B (builder, mapping); User View shows the clean Part C form. */
export function OutboundFormsPage() {
  const { state } = useAppState()

  if (state.ui.viewMode === 'user') {
    return <OutboundFormUser />
  }

  return (
    <div className={styles.adminStack}>
      <OutboundFormBuilderPage />
      <OutboundMappingPage />
    </div>
  )
}
