import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { RootState } from '../../app/appState.types'
import { createInitialRootState } from '../../app/initialState'
import { saveState } from '../../lib/persistence/localStorage'
import { renderWithProviders } from '../../test/testUtils'
import { OutboundFormsPage } from './OutboundFormsPage'

function seedViewMode(viewMode: 'admin' | 'user') {
  const state: RootState = { ...createInitialRootState(), ui: { viewMode } }
  saveState(state)
}

describe('OutboundFormsPage', () => {
  it('shows the admin builder and mapping panels in Admin view', () => {
    seedViewMode('admin')
    renderWithProviders(<OutboundFormsPage />)
    expect(screen.getByText('Outbound Form Builder')).toBeInTheDocument()
    expect(screen.getByText('Outbound Mapping Configuration')).toBeInTheDocument()
  })

  it('shows only the clean end-user form in User view — no admin chrome', () => {
    seedViewMode('user')
    renderWithProviders(<OutboundFormsPage />)
    expect(screen.queryByText('Outbound Form Builder')).not.toBeInTheDocument()
    expect(screen.queryByText('Outbound Mapping Configuration')).not.toBeInTheDocument()
  })
})
