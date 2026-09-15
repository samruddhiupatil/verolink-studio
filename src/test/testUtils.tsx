import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AppStateProvider } from '../app/AppStateContext'

/** Wraps a component under test with the same providers the real app mounts with. */
export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  return render(
    <AppStateProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AppStateProvider>,
  )
}
