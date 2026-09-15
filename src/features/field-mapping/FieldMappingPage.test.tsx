import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { RootState } from '../../app/appState.types'
import { createInitialRootState } from '../../app/initialState'
import { saveState } from '../../lib/persistence/localStorage'
import { renderWithProviders } from '../../test/testUtils'
import { FieldMappingPage } from './FieldMappingPage'

function seedState(overrides: Partial<RootState> = {}) {
  const state = { ...createInitialRootState(), ...overrides }
  saveState(state)
  return state
}

describe('FieldMappingPage', () => {
  it('shows an empty-state guard directing to the Test Console when there is no prior test response', () => {
    renderWithProviders(<FieldMappingPage />)
    expect(screen.getByText(/Run a test in the/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Test Console' })).toHaveAttribute('href', '/test-console')
  })

  it('adds a mapping row once a test response is present, and updates the diff preview live', async () => {
    const user = userEvent.setup()
    seedState({
      lastTestResponse: { endpointId: 'ep1', raw: { email: 'acme@example.com' }, timestamp: '2026-01-01T00:00:00.000Z' },
    })
    renderWithProviders(<FieldMappingPage />)

    await user.click(screen.getByRole('button', { name: '+ Add Mapping' }))

    expect(screen.getByLabelText('Source field')).toHaveValue('$.email')
    expect(screen.getAllByText('acme@example.com').length).toBeGreaterThan(0)

    await user.selectOptions(screen.getByLabelText('Transform'), 'Uppercase')
    expect(screen.getByText('ACME@EXAMPLE.COM')).toBeInTheDocument()
  })

  it('disables Export until at least one mapping exists', async () => {
    const user = userEvent.setup()
    seedState({
      lastTestResponse: { endpointId: 'ep1', raw: { email: 'a@b.com' }, timestamp: '2026-01-01T00:00:00.000Z' },
    })
    renderWithProviders(<FieldMappingPage />)

    expect(screen.getByRole('button', { name: 'Export connector-mapping.json' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: '+ Add Mapping' }))

    expect(screen.getByRole('button', { name: 'Export connector-mapping.json' })).toBeEnabled()
  })

  it('removes a mapping row when its remove button is clicked', async () => {
    const user = userEvent.setup()
    seedState({
      lastTestResponse: { endpointId: 'ep1', raw: { email: 'a@b.com' }, timestamp: '2026-01-01T00:00:00.000Z' },
    })
    renderWithProviders(<FieldMappingPage />)

    await user.click(screen.getByRole('button', { name: '+ Add Mapping' }))
    expect(screen.getByLabelText('Source field')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Remove mapping' }))
    expect(screen.queryByLabelText('Source field')).not.toBeInTheDocument()
    expect(screen.getByText('No mappings yet.')).toBeInTheDocument()
  })
})
