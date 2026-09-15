import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { STORAGE_KEY } from '../lib/persistence/localStorage'
import { AppStateProvider, useAppState } from './AppStateContext'

function TestConsumer() {
  const { state, dispatch } = useAppState()
  return (
    <div>
      <span data-testid="connector-name">{state.connector.name}</span>
      <button onClick={() => dispatch({ type: 'UPDATE_CONNECTOR', payload: { name: 'Vendor Sync' } })}>
        Set Name
      </button>
    </div>
  )
}

describe('AppStateProvider', () => {
  it('throws a clear error when useAppState is used outside the provider', () => {
    function Broken() {
      useAppState()
      return null
    }
    // Suppress the expected React error-boundary console noise for this one assertion.
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Broken />)).toThrow('useAppState must be used within an AppStateProvider')
    consoleError.mockRestore()
  })

  it('dispatching an action updates state visible to consumers', async () => {
    const user = userEvent.setup()
    render(
      <AppStateProvider>
        <TestConsumer />
      </AppStateProvider>,
    )

    expect(screen.getByTestId('connector-name')).toHaveTextContent('')
    await user.click(screen.getByRole('button', { name: 'Set Name' }))
    expect(screen.getByTestId('connector-name')).toHaveTextContent('Vendor Sync')
  })

  it('debounces persistence to localStorage after a dispatch', async () => {
    vi.useFakeTimers()

    render(
      <AppStateProvider>
        <TestConsumer />
      </AppStateProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Set Name' }))

    // Not yet written — debounce window hasn't elapsed.
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    await vi.advanceTimersByTimeAsync(300)

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(persisted.connector.name).toBe('Vendor Sync')
  })
})
