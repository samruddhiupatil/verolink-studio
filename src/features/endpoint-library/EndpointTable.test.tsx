import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { EndpointDefinition } from '../../domain/endpoint.types'
import { EndpointTable } from './EndpointTable'

function endpoint(overrides: Partial<EndpointDefinition>): EndpointDefinition {
  return {
    id: overrides.id ?? 'e1',
    label: 'Get Users',
    method: 'GET',
    path: '/users',
    headers: [],
    queryParams: [],
    responseSchema: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

const ENDPOINTS = [
  endpoint({ id: 'a', label: 'Get Users', path: '/users' }),
  endpoint({ id: 'b', label: 'Create Post', method: 'POST', path: '/posts' }),
  endpoint({ id: 'c', label: 'Delete Album', method: 'DELETE', path: '/albums/{{id}}' }),
]

describe('EndpointTable', () => {
  it('renders one row per endpoint, sorted by label ascending by default', () => {
    render(<EndpointTable endpoints={ENDPOINTS} searchQuery="" onEdit={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />)
    const rows = screen.getAllByRole('row').slice(1) // skip header row
    expect(within(rows[0]).getByText('Create Post')).toBeInTheDocument()
    expect(within(rows[1]).getByText('Delete Album')).toBeInTheDocument()
    expect(within(rows[2]).getByText('Get Users')).toBeInTheDocument()
  })

  it('filters rows by a case-insensitive match on label or path', () => {
    render(<EndpointTable endpoints={ENDPOINTS} searchQuery="album" onEdit={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />)
    expect(screen.getByText('Delete Album')).toBeInTheDocument()
    expect(screen.queryByText('Get Users')).not.toBeInTheDocument()
  })

  it('reverses sort order (to descending) when the already-active column header is clicked again', async () => {
    const user = userEvent.setup()
    render(<EndpointTable endpoints={ENDPOINTS} searchQuery="" onEdit={vi.fn()} onDelete={vi.fn()} onDuplicate={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: /^Label/ }))
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]).getByText('Get Users')).toBeInTheDocument()
  })

  it('calls onEdit/onDuplicate/onDelete with the row id when its action is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    const onDuplicate = vi.fn()
    const onDelete = vi.fn()
    render(<EndpointTable endpoints={[ENDPOINTS[0]]} searchQuery="" onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.click(screen.getByRole('button', { name: 'Duplicate' }))
    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onEdit).toHaveBeenCalledWith('a')
    expect(onDuplicate).toHaveBeenCalledWith('a')
    expect(onDelete).toHaveBeenCalledWith('a')
  })
})
