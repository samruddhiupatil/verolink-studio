import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { renderWithProviders } from '../test/testUtils'
import { AppShell } from './AppShell'
import { ROUTES } from './routeConfig'

function renderApp(route = '/') {
  return renderWithProviders(
    <Routes>
      <Route element={<AppShell />}>
        {ROUTES.map((r) => (
          <Route key={r.path} path={r.path} element={<r.Component />} />
        ))}
      </Route>
    </Routes>,
    { route },
  )
}

describe('AppShell', () => {
  it('renders a nav link for every section', () => {
    renderApp()
    for (const route of ROUTES) {
      expect(screen.getByRole('link', { name: route.label })).toBeInTheDocument()
    }
  })

  it('navigates to the corresponding page when a sidebar link is clicked', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: 'Authentication' }))
    expect(screen.getByRole('heading', { name: 'Authentication' })).toBeInTheDocument()
  })

  it('shows the Sandbox environment badge by default, persistently in the header', () => {
    renderApp()
    expect(screen.getByTestId('header-environment-badge')).toHaveTextContent('Sandbox')
  })

  it('the environment badge stays visible when navigating between sections', async () => {
    const user = userEvent.setup()
    renderApp()

    await user.click(screen.getByRole('link', { name: 'Endpoint Library' }))
    expect(screen.getByTestId('header-environment-badge')).toHaveTextContent('Sandbox')
  })

  it('the Admin/User view toggle defaults to Admin and can switch to User', async () => {
    const user = userEvent.setup()
    renderApp()

    const adminOption = screen.getByRole('radio', { name: 'Admin' })
    const userOption = screen.getByRole('radio', { name: 'User' })
    expect(adminOption).toHaveAttribute('aria-checked', 'true')
    expect(userOption).toHaveAttribute('aria-checked', 'false')

    await user.click(userOption)

    expect(userOption).toHaveAttribute('aria-checked', 'true')
    expect(adminOption).toHaveAttribute('aria-checked', 'false')
  })
})
