import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TransformPicker } from './TransformPicker'

describe('TransformPicker', () => {
  it('does not show an arg input for a transform that takes no argument', () => {
    render(<TransformPicker value={{ type: 'uppercase' }} onChange={vi.fn()} />)
    expect(screen.queryByLabelText('Prefix text')).not.toBeInTheDocument()
  })

  it('shows a prefix text input when Prefix is selected', () => {
    render(<TransformPicker value={{ type: 'prefix', arg: 'VEN-' }} onChange={vi.fn()} />)
    expect(screen.getByLabelText('Prefix text')).toHaveValue('VEN-')
  })

  it('clears the arg when switching away from prefix/suffix', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TransformPicker value={{ type: 'prefix', arg: 'VEN-' }} onChange={onChange} />)

    await user.selectOptions(screen.getByLabelText('Transform'), 'Uppercase')

    expect(onChange).toHaveBeenCalledWith({ type: 'uppercase', arg: undefined })
  })
})
