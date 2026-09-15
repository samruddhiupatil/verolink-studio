import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RequestBodyEditor } from './RequestBodyEditor'

describe('RequestBodyEditor', () => {
  it('renders nothing for GET (a method with no body)', () => {
    const { container } = render(<RequestBodyEditor method="GET" value="" onChange={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders for POST/PUT/PATCH', () => {
    render(<RequestBodyEditor method="POST" value="" onChange={vi.fn()} />)
    expect(screen.getByLabelText('Request Body')).toBeInTheDocument()
  })

  it('shows no error for well-formed JSON', () => {
    render(<RequestBodyEditor method="POST" value='{"title":"Hi"}' onChange={vi.fn()} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('shows an inline error for malformed JSON', () => {
    render(<RequestBodyEditor method="POST" value="{not valid" onChange={vi.fn()} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('treats an empty body as valid (optional field)', () => {
    render(<RequestBodyEditor method="PUT" value="" onChange={vi.fn()} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
