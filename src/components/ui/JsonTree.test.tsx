import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { JsonTree } from './JsonTree'

describe('JsonTree', () => {
  it('renders scalar leaf values', () => {
    render(<JsonTree data={{ name: 'Acme', active: true, count: 3, note: null }} />)
    expect(screen.getByText('"Acme"')).toBeInTheDocument()
    expect(screen.getByText('true')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('null')).toBeInTheDocument()
  })

  it('collapses nested nodes deeper than the default depth and expands on click', async () => {
    const user = userEvent.setup()
    render(<JsonTree data={{ a: { b: { c: 'deep-value' } } }} />)

    expect(screen.queryByText('"deep-value"')).not.toBeInTheDocument()

    const toggles = screen.getAllByRole('button', { name: 'Expand' })
    for (const toggle of toggles) {
      await user.click(toggle)
    }

    expect(screen.getByText('"deep-value"')).toBeInTheDocument()
  })

  it('invokes onSelectLeaf with the resolved path when a leaf is clicked', async () => {
    const user = userEvent.setup()
    const onSelectLeaf = vi.fn()
    render(<JsonTree data={{ email: 'a@b.com' }} onSelectLeaf={onSelectLeaf} />)

    await user.click(screen.getByTitle('Map $.email'))

    expect(onSelectLeaf).toHaveBeenCalledWith('$.email', 'a@b.com')
  })

  it('renders an empty array/object without a toggle', () => {
    render(<JsonTree data={{ items: [], extra: {} }} />)
    expect(screen.getByText('[]')).toBeInTheDocument()
    expect(screen.getByText('{}')).toBeInTheDocument()
  })
})
