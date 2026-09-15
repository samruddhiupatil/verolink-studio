import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RequestHistoryEntry } from '../../domain/history.types'
import { RequestHistoryList } from './RequestHistoryList'

function entry(id: string, overrides: Partial<RequestHistoryEntry> = {}): RequestHistoryEntry {
  return {
    id,
    timestamp: '2026-01-01T12:00:00.000Z',
    endpointId: 'ep1',
    endpointLabel: `Entry ${id}`,
    method: 'GET',
    resolvedUrl: 'https://api.example.com',
    requestHeaders: {},
    statusCode: 200,
    latencyMs: 10,
    source: 'test-console',
    ...overrides,
  }
}

describe('RequestHistoryList', () => {
  it('shows an empty message when there is no history', () => {
    render(<RequestHistoryList history={[]} onSelect={vi.fn()} />)
    expect(screen.getByText('No requests run yet.')).toBeInTheDocument()
  })

  it('renders one row per entry with label, status, and latency', () => {
    render(<RequestHistoryList history={[entry('a'), entry('b', { statusCode: 404 })]} onSelect={vi.fn()} />)
    expect(screen.getByText('Entry a')).toBeInTheDocument()
    expect(screen.getByText('Entry b')).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('calls onSelect with the full entry when a row is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const target = entry('a')
    render(<RequestHistoryList history={[target]} onSelect={onSelect} />)

    await user.click(screen.getByText('Entry a'))

    expect(onSelect).toHaveBeenCalledWith(target)
  })
})
