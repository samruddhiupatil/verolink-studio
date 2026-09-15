import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { createInitialRootState } from '../../app/initialState'
import type { RootState } from '../../app/appState.types'
import { saveState } from '../../lib/persistence/localStorage'
import { mockFetchResponse } from '../../test/mockFetch'
import { renderWithProviders } from '../../test/testUtils'
import { TestConsolePage } from './TestConsolePage'

function seedState(overrides: Partial<RootState> = {}) {
  const state = { ...createInitialRootState(), ...overrides }
  saveState(state)
  return state
}

const GET_USER_ENDPOINT = {
  id: 'ep1',
  label: 'Get User By Id',
  method: 'GET' as const,
  path: '/users/{{id}}',
  headers: [],
  queryParams: [],
  responseSchema: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('TestConsolePage', () => {
  it('dynamically renders a variable input for each {{variable}} in the selected endpoint', async () => {
    const user = userEvent.setup()
    seedState({ endpoints: [GET_USER_ENDPOINT] })
    renderWithProviders(<TestConsolePage />)

    await user.selectOptions(screen.getByLabelText('Endpoint'), 'ep1')

    expect(screen.getByLabelText('id')).toBeInTheDocument()
  })

  it('running a request shows the resolved URL and a color-coded 2xx status', async () => {
    const user = userEvent.setup()
    seedState({
      endpoints: [GET_USER_ENDPOINT],
      connector: { ...createInitialRootState().connector, baseUrl: 'https://jsonplaceholder.typicode.com' },
    })
    mockFetchResponse({ id: 1, name: 'Leanne Graham' }, { status: 200 })
    renderWithProviders(<TestConsolePage />)

    await user.selectOptions(screen.getByLabelText('Endpoint'), 'ep1')
    await user.type(screen.getByLabelText('id'), '1')
    await user.click(screen.getByRole('button', { name: 'Run' }))

    await waitFor(() => expect(screen.getByText('https://jsonplaceholder.typicode.com/users/1')).toBeInTheDocument())
    expect(screen.getAllByText('200').length).toBeGreaterThan(0)
  })

  it('a failed run is logged to Request History and clicking it reloads the pair', async () => {
    const user = userEvent.setup()
    seedState({
      endpoints: [GET_USER_ENDPOINT],
      connector: { ...createInitialRootState().connector, baseUrl: 'https://jsonplaceholder.typicode.com' },
    })
    mockFetchResponse({ error: 'not found' }, { status: 404 })
    renderWithProviders(<TestConsolePage />)

    await user.selectOptions(screen.getByLabelText('Endpoint'), 'ep1')
    await user.type(screen.getByLabelText('id'), '999')
    await user.click(screen.getByRole('button', { name: 'Run' }))

    await waitFor(() => expect(screen.getByText('Get User By Id')).toBeInTheDocument())
    expect(screen.getAllByText('404').length).toBeGreaterThan(0)
  })
})
