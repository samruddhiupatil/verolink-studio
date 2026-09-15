import { nanoid } from 'nanoid'
import { useState } from 'react'
import { useAppState } from '../../app/AppStateContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Panel } from '../../components/ui/Panel'
import { createBlankEndpoint, type EndpointDefinition } from '../../domain/endpoint.types'
import { EndpointFormPanel } from './EndpointFormPanel'
import styles from './EndpointLibraryPage.module.css'
import { EndpointTable } from './EndpointTable'

type Mode = { kind: 'list' } | { kind: 'form'; endpoint: EndpointDefinition; isNew: boolean }

export function EndpointLibraryPage() {
  const { state, dispatch } = useAppState()
  const [mode, setMode] = useState<Mode>({ kind: 'list' })
  const [searchQuery, setSearchQuery] = useState('')

  function startCreate() {
    setMode({ kind: 'form', endpoint: createBlankEndpoint(nanoid()), isNew: true })
  }

  function startEdit(id: string) {
    const endpoint = state.endpoints.find((e) => e.id === id)
    if (endpoint) setMode({ kind: 'form', endpoint, isNew: false })
  }

  function handleSave(endpoint: EndpointDefinition) {
    dispatch({ type: mode.kind === 'form' && mode.isNew ? 'ADD_ENDPOINT' : 'UPDATE_ENDPOINT', payload: endpoint })
    setMode({ kind: 'list' })
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_ENDPOINT', payload: { id } })
  }

  function handleDuplicate(id: string) {
    const source = state.endpoints.find((e) => e.id === id)
    if (!source) return
    const now = new Date().toISOString()
    dispatch({
      type: 'ADD_ENDPOINT',
      payload: { ...source, id: nanoid(), label: `${source.label} (Copy)`, createdAt: now, updatedAt: now },
    })
  }

  return (
    <div className={styles.page}>
      {mode.kind === 'list' ? (
        <Panel
          title="Endpoint Library"
          subtitle="Reusable API endpoints available to the Test Console and outbound forms."
          actions={<Button variant="primary" onClick={startCreate}>+ Add Endpoint</Button>}
        >
          <div className={styles.toolbar}>
            <Input
              className={styles.searchInput}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by label or path…"
              aria-label="Search endpoints"
            />
          </div>
          {state.endpoints.length === 0 ? (
            <p className={styles.empty}>No endpoints yet. Add one to get started.</p>
          ) : (
            <EndpointTable
              endpoints={state.endpoints}
              searchQuery={searchQuery}
              onEdit={startEdit}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          )}
        </Panel>
      ) : (
        <Panel title={mode.isNew ? 'Add Endpoint' : `Edit: ${mode.endpoint.label || 'Untitled'}`}>
          <EndpointFormPanel
            initialEndpoint={mode.endpoint}
            isNew={mode.isNew}
            onSave={handleSave}
            onCancel={() => setMode({ kind: 'list' })}
          />
        </Panel>
      )}
    </div>
  )
}
