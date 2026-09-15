import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OutboundFormField } from '../../../domain/outbound.types'
import { FormFieldList } from './FormFieldList'

// jsdom gives every element a zero-sized bounding rect, which starves dnd-kit's
// keyboard sensor of the layout signal it needs to detect which item is next.
// Assigning each element a rect based on its position among siblings gives the
// collision detector something real to compare, so Arrow-key movement works.
beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
    const parent = this.parentElement
    const index = parent ? Array.from(parent.children).indexOf(this) : 0
    const top = index * 60
    return {
      width: 200,
      height: 50,
      top,
      left: 0,
      right: 200,
      bottom: top + 50,
      x: 0,
      y: top,
      toJSON() {
        return this
      },
    } as DOMRect
  })
})

function field(id: string, label: string): OutboundFormField {
  return { id, order: 0, label, fieldType: 'Text', required: false }
}

describe('FormFieldList', () => {
  it('shows an empty message when there are no fields', () => {
    render(<FormFieldList fields={[]} onChange={vi.fn()} />)
    expect(screen.getByText('No fields yet. Add one to get started.')).toBeInTheDocument()
  })

  it('renders one editor card per field, in order', () => {
    render(<FormFieldList fields={[field('a', 'Title'), field('b', 'Body')]} onChange={vi.fn()} />)
    const labelInputs = screen.getAllByLabelText('Field Label')
    expect(labelInputs).toHaveLength(2)
    expect(labelInputs[0]).toHaveValue('Title')
    expect(labelInputs[1]).toHaveValue('Body')
  })

  it('removes a field and renumbers order when its remove button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FormFieldList fields={[field('a', 'Title'), field('b', 'Body')]} onChange={onChange} />)

    const removeButtons = screen.getAllByRole('button', { name: 'Remove field' })
    await user.click(removeButtons[0])

    expect(onChange).toHaveBeenCalledWith([{ ...field('b', 'Body'), order: 0 }])
  })

  it('reorders fields via the keyboard sensor drag handle (Space to pick up, Arrow to move, Space to drop)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FormFieldList fields={[field('a', 'Title'), field('b', 'Body')]} onChange={onChange} />)

    const handles = screen.getAllByRole('button', { name: 'Drag to reorder' })
    handles[0].focus()

    await user.keyboard('[Space]')
    await user.keyboard('[ArrowDown]')
    await user.keyboard('[Space]')

    expect(onChange).toHaveBeenCalled()
    const reordered = onChange.mock.calls.at(-1)?.[0] as OutboundFormField[]
    expect(reordered.map((f) => f.id)).toEqual(['b', 'a'])
    expect(reordered.map((f) => f.order)).toEqual([0, 1])
  })
})
