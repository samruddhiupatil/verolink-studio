import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TokenCountdown } from './TokenCountdown'

describe('TokenCountdown', () => {
  it('shows a Fetch Token button and a "simulated" note when there is no session', () => {
    render(<TokenCountdown onFetchToken={vi.fn()} onClearToken={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Fetch Token' })).toBeInTheDocument()
    expect(screen.getByText(/no live OAuth server/)).toBeInTheDocument()
  })

  it('calls onFetchToken when the button is clicked', async () => {
    const user = userEvent.setup()
    const onFetchToken = vi.fn()
    render(<TokenCountdown onFetchToken={onFetchToken} onClearToken={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Fetch Token' }))
    expect(onFetchToken).toHaveBeenCalled()
  })

  it('shows a live countdown for a session that has not expired', () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    render(
      <TokenCountdown
        session={{ accessToken: 'tok', expiresAt: '2026-01-01T00:02:30.000Z', simulated: true }}
        onFetchToken={vi.fn()}
        onClearToken={vi.fn()}
      />,
    )
    expect(screen.getByText('Expires in 02:30')).toBeInTheDocument()
  })

  it('counts down as real time advances', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    render(
      <TokenCountdown
        session={{ accessToken: 'tok', expiresAt: '2026-01-01T00:00:05.000Z', simulated: true }}
        onFetchToken={vi.fn()}
        onClearToken={vi.fn()}
      />,
    )
    expect(screen.getByText('Expires in 00:05')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(screen.getByText('Expires in 00:02')).toBeInTheDocument()
  })

  it('shows "Token expired" and a re-fetch action once the expiry passes', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    render(
      <TokenCountdown
        session={{ accessToken: 'tok', expiresAt: '2026-01-01T00:00:01.000Z', simulated: true }}
        onFetchToken={vi.fn()}
        onClearToken={vi.fn()}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.getByText('Token expired')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Fetch new token' })).toBeInTheDocument()
  })
})
