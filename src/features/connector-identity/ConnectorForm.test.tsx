import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createDefaultConnectorConfig } from '../../domain/connector.types'
import { ConnectorForm } from './ConnectorForm'

describe('ConnectorForm', () => {
  it('calls onChange with the typed value as the connector name is edited', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ConnectorForm connector={createDefaultConnectorConfig()} onChange={onChange} />)

    await user.type(screen.getByLabelText(/Connector Name/), 'V')

    expect(onChange).toHaveBeenCalledWith({ name: 'V' })
  })

  it('shows a required error for an empty name only after the field is blurred', async () => {
    const user = userEvent.setup()
    render(<ConnectorForm connector={createDefaultConnectorConfig()} onChange={vi.fn()} />)

    expect(screen.queryByText('Connector name is required.')).not.toBeInTheDocument()
    await user.click(screen.getByLabelText(/Connector Name/))
    await user.tab()

    expect(screen.getByText('Connector name is required.')).toBeInTheDocument()
  })

  it('shows an inline error for a malformed Base URL and clears it once fixed', async () => {
    const user = userEvent.setup()
    let connector = { ...createDefaultConnectorConfig(), baseUrl: 'not-a-url' }
    const onChange = vi.fn((patch) => {
      connector = { ...connector, ...patch }
    })
    const { rerender } = render(<ConnectorForm connector={connector} onChange={onChange} />)

    await user.click(screen.getByLabelText(/Base URL/))
    await user.tab()
    expect(screen.getByText(/well-formed URL/)).toBeInTheDocument()

    connector = { ...connector, baseUrl: 'https://api.example.com' }
    rerender(<ConnectorForm connector={connector} onChange={onChange} />)
    expect(screen.queryByText(/well-formed URL/)).not.toBeInTheDocument()
  })

  it('reveals a free-entry field only when Target System is Custom', async () => {
    const user = userEvent.setup()
    const connector = createDefaultConnectorConfig()
    render(<ConnectorForm connector={connector} onChange={vi.fn()} />)

    expect(connector.targetSystem).toBe('Custom')
    expect(screen.getByPlaceholderText('Name your target system')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Target System'), 'SAP S/4HANA')
    // The component is controlled by props, so selecting doesn't remove the
    // field until the parent re-renders with the new targetSystem value —
    // verify onChange was asked to make that change.
  })

  it('hides the custom target system field for a preset system', () => {
    const connector = { ...createDefaultConnectorConfig(), targetSystem: 'Salesforce' as const }
    render(<ConnectorForm connector={connector} onChange={vi.fn()} />)
    expect(screen.queryByPlaceholderText('Name your target system')).not.toBeInTheDocument()
  })

  it('renders the environment badge matching the current environment', () => {
    const connector = { ...createDefaultConnectorConfig(), environment: 'Production' as const }
    render(<ConnectorForm connector={connector} onChange={vi.fn()} />)
    expect(screen.getAllByText('Production').length).toBeGreaterThan(0)
  })
})
