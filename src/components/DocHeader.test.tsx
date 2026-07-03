import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DocHeader } from './DocHeader'
import type { LegislationDoc } from '../types/legislation'

function makeDoc(overrides: Partial<LegislationDoc> = {}): LegislationDoc {
  return {
    id: '1',
    docType: 'new_law',
    title: '',
    year: '',
    blocks: [],
    createdAt: 'now',
    updatedAt: 'now',
    ...overrides,
  }
}

function baseProps(overrides: Partial<React.ComponentProps<typeof DocHeader>> = {}) {
  return {
    doc: makeDoc(),
    exportDisabled: false,
    onMetaChange: vi.fn(),
    onNewDoc: vi.fn(),
    onExport: vi.fn(),
    onLoadDoc: vi.fn(),
    ...overrides,
  }
}

describe('DocHeader', () => {
  it('shows a partial-support warning only for amending_law', () => {
    const { rerender } = render(<DocHeader {...baseProps({ doc: makeDoc({ docType: 'new_law' }) })} />)
    expect(screen.queryByText(/תמיכה חלקית/)).not.toBeInTheDocument()

    rerender(<DocHeader {...baseProps({ doc: makeDoc({ docType: 'amending_law' }) })} />)
    expect(screen.getByText(/תמיכה חלקית/)).toBeInTheDocument()
  })

  it('rejects a malformed JSON file on load without calling onLoadDoc', async () => {
    const user = userEvent.setup()
    const onLoadDoc = vi.fn()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<DocHeader {...baseProps({ onLoadDoc })} />)

    const file = new File(['{ not valid json'], 'bad.json', { type: 'application/json' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(onLoadDoc).not.toHaveBeenCalled()
    expect(alertSpy).toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('rejects well-formed JSON that is not a legislation doc', async () => {
    const user = userEvent.setup()
    const onLoadDoc = vi.fn()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<DocHeader {...baseProps({ onLoadDoc })} />)

    const file = new File([JSON.stringify({ hello: 'world' })], 'bad.json', { type: 'application/json' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(onLoadDoc).not.toHaveBeenCalled()
    expect(alertSpy).toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('accepts a well-formed legislation doc file', async () => {
    const user = userEvent.setup()
    const onLoadDoc = vi.fn()
    render(<DocHeader {...baseProps({ onLoadDoc })} />)

    const doc = makeDoc({ title: 'נטען' })
    const file = new File([JSON.stringify(doc)], 'good.legislation.json', { type: 'application/json' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, file)

    expect(onLoadDoc).toHaveBeenCalledWith(doc)
  })
})
