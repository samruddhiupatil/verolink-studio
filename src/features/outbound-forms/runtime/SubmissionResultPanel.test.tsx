import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { RequestHistoryEntry } from '../../../domain/history.types'
import { SubmissionResultPanel } from './SubmissionResultPanel'

function entry(overrides: Partial<RequestHistoryEntry>): RequestHistoryEntry {
  return {
    id: 'h1',
    timestamp: '2026-01-01T00:00:00.000Z',
    endpointId: 'ep1',
    endpointLabel: 'Create Post',
    method: 'POST',
    resolvedUrl: 'https://jsonplaceholder.typicode.com/posts',
    requestHeaders: {},
    statusCode: 201,
    latencyMs: 50,
    responseBody: '{"id":101}',
    source: 'outbound-submission',
    ...overrides,
  }
}

function renderPanel(e: RequestHistoryEntry, onBackToForm = vi.fn()) {
  return render(
    <MemoryRouter>
      <SubmissionResultPanel entry={e} onBackToForm={onBackToForm} />
    </MemoryRouter>,
  )
}

describe('SubmissionResultPanel', () => {
  it('renders a success variant with the response body and a history link', () => {
    renderPanel(entry({ statusCode: 201, responseBody: '{"id":101}' }))
    expect(screen.getByText('Submission Successful')).toBeInTheDocument()
    expect(screen.getByText(/"id": 101/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'View in Request History' })).toHaveAttribute('href', '/test-console')
  })

  it('renders a 4xx/5xx failure variant with Edit & Retry', async () => {
    const user = userEvent.setup()
    const onBackToForm = vi.fn()
    renderPanel(entry({ statusCode: 422, responseBody: '{"error":"invalid"}' }), onBackToForm)

    expect(screen.getByText('Submission Failed')).toBeInTheDocument()
    expect(screen.getByText('422')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Edit & Retry' }))
    expect(onBackToForm).toHaveBeenCalled()
  })

  it('renders the honest collapsed network-failure variant', () => {
    renderPanel(entry({ statusCode: null, errorKind: 'unreachable', responseBody: undefined }))
    expect(screen.getByText('Unreachable')).toBeInTheDocument()
    expect(screen.getByText(/network error, a CORS policy block/)).toBeInTheDocument()
  })

  it('renders the timeout variant distinctly from a generic unreachable failure', () => {
    renderPanel(entry({ statusCode: null, errorKind: 'timeout' }))
    expect(screen.getByText('Timed Out')).toBeInTheDocument()
    expect(screen.getByText(/timed out before a response/)).toBeInTheDocument()
  })
})
