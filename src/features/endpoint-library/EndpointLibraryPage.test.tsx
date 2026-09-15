import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '../../test/testUtils'
import { EndpointLibraryPage } from './EndpointLibraryPage'

describe('EndpointLibraryPage', () => {
  it('adds a new endpoint through the form and shows it in the table', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EndpointLibraryPage />)

    await user.click(screen.getByRole('button', { name: '+ Add Endpoint' }))
    await user.type(screen.getByLabelText(/Label/), 'Get Vendor List')
    await user.type(screen.getByLabelText(/Path/), '/vendors')
    await user.click(screen.getByRole('button', { name: 'Add Endpoint' }))

    expect(screen.getByText('Get Vendor List')).toBeInTheDocument()
    expect(screen.getByText('/vendors')).toBeInTheDocument()
  })

  it('blocks saving until Label and Path are filled, with inline errors', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EndpointLibraryPage />)

    await user.click(screen.getByRole('button', { name: '+ Add Endpoint' }))
    await user.click(screen.getByRole('button', { name: 'Add Endpoint' }))

    expect(screen.getByText('Label is required.')).toBeInTheDocument()
    expect(screen.getByText('Path is required.')).toBeInTheDocument()
  })

  it('edits an existing endpoint', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EndpointLibraryPage />)

    await user.click(screen.getByRole('button', { name: '+ Add Endpoint' }))
    await user.type(screen.getByLabelText(/Label/), 'Get Users')
    await user.type(screen.getByLabelText(/Path/), '/users')
    await user.click(screen.getByRole('button', { name: 'Add Endpoint' }))

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    const labelInput = screen.getByLabelText(/Label/)
    await user.clear(labelInput)
    await user.type(labelInput, 'Get All Users')
    await user.click(screen.getByRole('button', { name: 'Save Changes' }))

    expect(screen.getByText('Get All Users')).toBeInTheDocument()
    expect(screen.queryByText('Get Users')).not.toBeInTheDocument()
  })

  it('duplicates an endpoint with a "(Copy)" suffix', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EndpointLibraryPage />)

    await user.click(screen.getByRole('button', { name: '+ Add Endpoint' }))
    await user.type(screen.getByLabelText(/Label/), 'Get Users')
    await user.type(screen.getByLabelText(/Path/), '/users')
    await user.click(screen.getByRole('button', { name: 'Add Endpoint' }))

    await user.click(screen.getByRole('button', { name: 'Duplicate' }))

    expect(screen.getByText('Get Users (Copy)')).toBeInTheDocument()
    expect(screen.getByText('Get Users')).toBeInTheDocument()
  })

  it('deletes an endpoint', async () => {
    const user = userEvent.setup()
    renderWithProviders(<EndpointLibraryPage />)

    await user.click(screen.getByRole('button', { name: '+ Add Endpoint' }))
    await user.type(screen.getByLabelText(/Label/), 'Get Users')
    await user.type(screen.getByLabelText(/Path/), '/users')
    await user.click(screen.getByRole('button', { name: 'Add Endpoint' }))

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.queryByText('Get Users')).not.toBeInTheDocument()
    expect(screen.getByText('No endpoints yet. Add one to get started.')).toBeInTheDocument()
  })
})
