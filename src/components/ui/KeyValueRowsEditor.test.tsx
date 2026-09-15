import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { KeyValueRowsEditor } from './KeyValueRowsEditor'

describe('KeyValueRowsEditor', () => {
  it('shows an empty message when there are no rows', () => {
    render(<KeyValueRowsEditor rows={[]} onChange={vi.fn()} emptyMessage="No headers yet." />)
    expect(screen.getByText('No headers yet.')).toBeInTheDocument()
  })

  it('adds a new blank row when "Add row" is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<KeyValueRowsEditor rows={[]} onChange={onChange} addLabel="Add header" />)

    await user.click(screen.getByRole('button', { name: '+ Add header' }))

    expect(onChange).toHaveBeenCalledWith([expect.objectContaining({ key: '', value: '' })])
  })

  it('removes a row when its remove button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <KeyValueRowsEditor
        rows={[
          { id: 'a', key: 'X-One', value: '1' },
          { id: 'b', key: 'X-Two', value: '2' },
        ]}
        onChange={onChange}
      />,
    )

    const removeButtons = screen.getAllByRole('button', { name: 'Remove row' })
    await user.click(removeButtons[0])

    expect(onChange).toHaveBeenCalledWith([{ id: 'b', key: 'X-Two', value: '2' }])
  })

  it('updates a row key/value as the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<KeyValueRowsEditor rows={[{ id: 'a', key: '', value: '' }]} onChange={onChange} keyPlaceholder="Key" />)

    await user.type(screen.getByPlaceholderText('Key'), 'X')

    expect(onChange).toHaveBeenLastCalledWith([{ id: 'a', key: 'X', value: '' }])
  })
})
