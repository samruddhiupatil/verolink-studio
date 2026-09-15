import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import type { RootState } from '../../../app/appState.types'
import { createInitialRootState } from '../../../app/initialState'
import { saveState } from '../../../lib/persistence/localStorage'
import { renderWithProviders } from '../../../test/testUtils'
import { OutboundMappingPage } from './OutboundMappingPage'

function seedState(overrides: Partial<RootState> = {}) {
  const state = { ...createInitialRootState(), ...overrides }
  saveState(state)
  return state
}

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

const READ_ENDPOINT = {
  ...WRITE_ENDPOINT,
  id: 'ep2',
  label: 'Get Users',
  method: 'GET' as const,
  path: '/users',
}

describe('OutboundMappingPage', () => {
  it('only lists POST/PUT/PATCH endpoints as target write endpoint options', () => {
    seedState({ endpoints: [WRITE_ENDPOINT, READ_ENDPOINT] })
    renderWithProviders(<OutboundMappingPage />)

    const select = screen.getByLabelText('Target Write Endpoint')
    expect(screen.getByRole('option', { name: 'POST Create Post' })).toBeInTheDocument()
    expect(within(select).queryByRole('option', { name: /Get Users/ })).not.toBeInTheDocument()
  })

  it('matches the spec test scenario: Title/Body/Author ID mapped to $.title/$.body/$.userId', async () => {
    const user = userEvent.setup()
    seedState({
      endpoints: [WRITE_ENDPOINT],
      outbound: {
        targetEndpointId: 'ep1',
        fields: [
          { id: 'title', order: 0, label: 'Title', fieldType: 'Text', required: true, placeholderOrDefault: 'My Post' },
          { id: 'body', order: 1, label: 'Body', fieldType: 'Text', required: true, placeholderOrDefault: 'Body text' },
          { id: 'authorId', order: 2, label: 'Author ID', fieldType: 'Number', required: true, placeholderOrDefault: '7' },
        ],
        mappings: [],
      },
    })
    renderWithProviders(<OutboundMappingPage />)

    await user.type(screen.getByLabelText('Target path for Title'), '$.title')
    await user.type(screen.getByLabelText('Target path for Body'), '$.body')
    await user.type(screen.getByLabelText('Target path for Author ID'), '$.userId')

    const preview = screen.getByText(/"title"/).closest('pre')
    expect(preview).toHaveTextContent('"title": "My Post"')
    expect(preview).toHaveTextContent('"body": "Body text"')
    expect(preview).toHaveTextContent('"userId": 7')
  })
})
