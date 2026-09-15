import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/testUtils'
import { AuthenticationPage } from './AuthenticationPage'

describe('AuthenticationPage', () => {
  it('defaults to "None" with no fields shown', () => {
    renderWithProviders(<AuthenticationPage />)
    expect(screen.getByText('No authentication will be applied to requests.')).toBeInTheDocument()
  })

  it('switching Auth Type swaps the visible field panel', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthenticationPage />)

    await user.selectOptions(screen.getByLabelText('Auth Type'), 'API Key')
    expect(screen.getByLabelText('Header Name')).toBeInTheDocument();
    expect(screen.queryByLabelText('Username')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Auth Type'), 'Basic Auth')
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.queryByLabelText('Header Name')).not.toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Auth Type'), 'OAuth 2.0')
    expect(screen.getByLabelText('Token URL')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Auth Type'), 'Bearer Token')
    expect(screen.getByLabelText('Token')).toBeInTheDocument()

    await user.selectOptions(screen.getByLabelText('Auth Type'), 'Custom Header')
    expect(screen.getByText('No custom headers yet.')).toBeInTheDocument()
  })

  it('the Auth Preview panel updates live as bearer token fields change', async () => {
    const user = userEvent.setup()
    renderWithProviders(<AuthenticationPage />)

    await user.selectOptions(screen.getByLabelText('Auth Type'), 'Bearer Token')
    expect(screen.getByText('No headers or query params will be injected for this configuration.')).toBeInTheDocument()

    const tokenInput = screen.getByLabelText('Token')
    await user.type(tokenInput, 'abc123longenoughtoken')

    expect(screen.getByText('Authorization')).toBeInTheDocument()
  })
})
