import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SecretField } from './SecretField'

describe('SecretField', () => {
  it('masks the value by default (type=password)', () => {
    render(<SecretField value="hunter2" onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('hunter2')).toHaveAttribute('type', 'password')
  })

  it('reveals the value as plain text when Show is clicked, then re-masks on Hide', async () => {
    const user = userEvent.setup()
    render(<SecretField value="hunter2" onChange={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: 'Show value' }))
    expect(screen.getByDisplayValue('hunter2')).toHaveAttribute('type', 'text')

    await user.click(screen.getByRole('button', { name: 'Hide value' }))
    expect(screen.getByDisplayValue('hunter2')).toHaveAttribute('type', 'password')
  })

  it('calls onChange as the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    const { container } = render(<SecretField value="" onChange={onChange} />)

    const input = container.querySelector('input')
    expect(input).not.toBeNull()
    await user.type(input as HTMLInputElement, 'x')

    expect(onChange).toHaveBeenCalledWith('x')
  })
})
