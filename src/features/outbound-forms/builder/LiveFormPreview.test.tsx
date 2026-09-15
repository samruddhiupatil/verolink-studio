import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { OutboundFormField } from '../../../domain/outbound.types'
import { LiveFormPreview } from './LiveFormPreview'

describe('LiveFormPreview', () => {
  it('shows a placeholder message when there are no fields', () => {
    render(<LiveFormPreview fields={[]} />)
    expect(screen.getByText('Add fields to see the live preview.')).toBeInTheDocument()
  })

  it('renders one labeled input per field, matching each configured type', () => {
    const fields: OutboundFormField[] = [
      { id: 'a', order: 0, label: 'Title', fieldType: 'Text', required: true },
      { id: 'b', order: 1, label: 'Author ID', fieldType: 'Number', required: true },
      { id: 'c', order: 2, label: 'Country', fieldType: 'Dropdown', required: false, dropdownOptions: ['US', 'UK'] },
    ]
    render(<LiveFormPreview fields={fields} />)

    expect(screen.getByLabelText(/Title/)).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText(/Author ID/)).toHaveAttribute('type', 'number')
    expect(screen.getByLabelText(/Country/).tagName).toBe('SELECT')
    expect(screen.getByRole('option', { name: 'US' })).toBeInTheDocument()
  })

  it('shows required fields with an asterisk indicator', () => {
    const fields: OutboundFormField[] = [{ id: 'a', order: 0, label: 'Title', fieldType: 'Text', required: true }]
    render(<LiveFormPreview fields={fields} />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })
})
