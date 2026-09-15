import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { createDefaultConnectorConfig } from '../../domain/connector.types'
import { mockFetchAbortsOnSignal, mockFetchNetworkError, mockFetchResponse } from '../../test/mockFetch'
import { ConnectionHealthCheck } from './ConnectionHealthCheck'

describe('ConnectionHealthCheck', () => {
  it('disables the check button until the Base URL is well-formed', () => {
    render(<ConnectionHealthCheck connector={createDefaultConnectorConfig()} onResult={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Check Connection Health' })).toBeDisabled()
  })

  it('reports reachable with a latency once the fetch resolves', async () => {
    const user = userEvent.setup()
    mockFetchResponse({}, { status: 200 })
    const onResult = vi.fn()
    const connector = { ...createDefaultConnectorConfig(), baseUrl: 'https://jsonplaceholder.typicode.com' }
    render(<ConnectionHealthCheck connector={connector} onResult={onResult} />)

    await user.click(screen.getByRole('button', { name: 'Check Connection Health' }))

    await waitFor(() => expect(onResult).toHaveBeenCalled())
    const result = onResult.mock.calls[0][0]
    expect(result.reachable).toBe(true)
    expect(typeof result.latencyMs).toBe('number')
  })

  it('reports unreachable with the honest collapsed message on a network error', async () => {
    const user = userEvent.setup()
    mockFetchNetworkError()
    const onResult = vi.fn()
    const connector = { ...createDefaultConnectorConfig(), baseUrl: 'https://unreachable.invalid' }
    render(<ConnectionHealthCheck connector={connector} onResult={onResult} />)

    await user.click(screen.getByRole('button', { name: 'Check Connection Health' }))

    await waitFor(() => expect(onResult).toHaveBeenCalled())
    expect(onResult.mock.calls[0][0]).toMatchObject({ reachable: false, errorKind: 'unreachable' })
  })

  it('renders a "Reachable" badge and latency when lastHealthCheck is present', () => {
    const connector = {
      ...createDefaultConnectorConfig(),
      baseUrl: 'https://jsonplaceholder.typicode.com',
      lastHealthCheck: { timestamp: new Date().toISOString(), reachable: true, latencyMs: 42 },
    }
    render(<ConnectionHealthCheck connector={connector} onResult={vi.fn()} />)
    expect(screen.getByText('Reachable')).toBeInTheDocument()
    expect(screen.getByText('42 ms')).toBeInTheDocument()
  })

  it('classifies our own timeout distinctly from a generic unreachable failure', async () => {
    vi.useFakeTimers()
    mockFetchAbortsOnSignal()
    const onResult = vi.fn()
    const connector = { ...createDefaultConnectorConfig(), baseUrl: 'https://slow.example.com' }
    render(<ConnectionHealthCheck connector={connector} onResult={onResult} />)

    // fireEvent avoids userEvent's internal real-timer delays under fake timers.
    const { fireEvent } = await import('@testing-library/react')
    fireEvent.click(screen.getByRole('button', { name: 'Check Connection Health' }))

    await vi.advanceTimersByTimeAsync(8000)
    await vi.waitFor(() => expect(onResult).toHaveBeenCalled())

    expect(onResult.mock.calls[0][0]).toMatchObject({ reachable: false, errorKind: 'timeout' })
  })
})
