import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RootState } from '../../../app/appState.types'
import { createInitialRootState } from '../../../app/initialState'
import { saveState } from '../../../lib/persistence/localStorage'
import { mockFetchNetworkError, mockFetchResponse } from '../../../test/mockFetch'
import { renderWithProviders } from '../../../test/testUtils'
import { OutboundFormUser } from './OutboundFormUser'

const WRITE_ENDPOINT = {
  id: 'ep1',
  label: 'Create Post',
  method: 'POST' as const,
  path: '/posts',
  headers: [],
  queryParams: [],
  responseSchema: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function seedSpecScenario(overrides: Partial<RootState> = {}) {
  const state: RootState = {
    ...createInitialRootState(),
    connector: { ...createInitialRootState().connector, baseUrl: 'https://jsonplaceholder.typicode.com' },
    endpoints: [WRITE_ENDPOINT],
    outbound: {
      targetEndpointId: 'ep1',
      fields: [
        { id: 'title', order: 0, label: 'Title', fieldType: 'Text', required: true },
        { id: 'body', order: 1, label: 'Body', fieldType: 'Text', required: true },
        { id: 'authorId', order: 2, label: 'Author ID', fieldType: 'Number', required: true },
      ],
      mappings: [
        { formFieldId: 'title', targetJsonPath: '$.title', transform: { type: 'none' } },
        { formFieldId: 'body', targetJsonPath: '$.body', transform: { type: 'none' } },
        { formFieldId: 'authorId', targetJsonPath: '$.userId', transform: { type: 'none' } },
      ],
    },
    ...overrides,
  }
  saveState(state)
  return state
}

describe('OutboundFormUser', () => {
  it('shows an empty-state message when no target endpoint is configured', () => {
    saveState(createInitialRootState())
    renderWithProviders(<OutboundFormUser />)
    expect(screen.getByText(/isn't configured yet/)).toBeInTheDocument()
  })

  it('shows inline per-field required errors on submit, never a native alert', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert')
    seedSpecScenario()
    renderWithProviders(<OutboundFormUser />)

    await user.click(screen.getByRole('button', { name: 'Submit' }))

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(screen.getByText('Body is required.')).toBeInTheDocument()
    expect(screen.getByText('Author ID is required.')).toBeInTheDocument()
    expect(alertSpy).not.toHaveBeenCalled()
  })

  it('matches the spec test scenario end-to-end: submits Title/Body/Author ID and shows a 201 success result', async () => {
    const user = userEvent.setup()
    seedSpecScenario()
    mockFetchResponse({ title: 'My Post', body: 'Post body text', userId: 7, id: 101 }, { status: 201 })
    renderWithProviders(<OutboundFormUser />)

    await user.type(screen.getByLabelText(/Title/), 'My Post')
    await user.type(screen.getByLabelText(/Body/), 'Post body text')
    await user.type(screen.getByLabelText(/Author ID/), '7')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(screen.getByText('Submission Successful')).toBeInTheDocument())
    expect(screen.getByText('Success — 201')).toBeInTheDocument()
    expect(screen.getByText(/"userId": 7/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View in Request History' })).toBeInTheDocument()
  })

  it('shows a failure result with Edit & Retry that repopulates the form on a 4xx response', async () => {
    const user = userEvent.setup()
    seedSpecScenario()
    mockFetchResponse({ error: 'Bad request' }, { status: 400 })
    renderWithProviders(<OutboundFormUser />)

    await user.type(screen.getByLabelText(/Title/), 'My Post')
    await user.type(screen.getByLabelText(/Body/), 'Post body text')
    await user.type(screen.getByLabelText(/Author ID/), '7')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(screen.getByText('Submission Failed')).toBeInTheDocument())
    expect(screen.getByText('400')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit & Retry' }))

    expect(screen.getByLabelText(/Title/)).toHaveValue('My Post')
    expect(screen.getByLabelText(/Author ID/)).toHaveValue(7)
  })

  it('shows the honest collapsed network/CORS message on a network failure', async () => {
    const user = userEvent.setup()
    seedSpecScenario()
    mockFetchNetworkError()
    renderWithProviders(<OutboundFormUser />)

    await user.type(screen.getByLabelText(/Title/), 'My Post')
    await user.type(screen.getByLabelText(/Body/), 'Post body text')
    await user.type(screen.getByLabelText(/Author ID/), '7')
    await user.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(screen.getByText('Unreachable')).toBeInTheDocument())
    expect(screen.getByText(/network error, a CORS policy block/)).toBeInTheDocument()
  })
})
