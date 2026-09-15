import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AuthConfig } from '../../domain/auth.types'
import { AuthPreviewPanel } from './AuthPreviewPanel'

describe('AuthPreviewPanel', () => {
  it('shows a "no headers" message for type none', () => {
    render(<AuthPreviewPanel auth={{ type: 'none' }} />)
    expect(screen.getByText('No headers or query params will be injected for this configuration.')).toBeInTheDocument()
  })

  it('shows the redacted Authorization value for a bearer token', () => {
    const auth: AuthConfig = { type: 'bearer', token: 'eyJhbGciOiJIUzI1NiJ9.payload.signature' }
    render(<AuthPreviewPanel auth={auth} />)

    expect(screen.getByText('Authorization')).toBeInTheDocument()
    expect(screen.getByText(/Bearer ey••••••••/)).toBeInTheDocument()
    expect(screen.queryByText(auth.token)).not.toBeInTheDocument()
  })

  it('lists one row per named custom header', () => {
    const auth: AuthConfig = {
      type: 'customHeaders',
      headers: [
        { id: '1', key: 'X-Trace-Id', value: 'abc' },
        { id: '2', key: 'X-Env', value: 'sandbox' },
      ],
    }
    render(<AuthPreviewPanel auth={auth} />)

    expect(screen.getByText('Header: X-Trace-Id')).toBeInTheDocument()
    expect(screen.getByText('Header: X-Env')).toBeInTheDocument()
  })
})
