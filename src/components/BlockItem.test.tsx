import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlockItem } from './BlockItem'
import type { Block } from '../types/legislation'

function baseProps(block: Block, overrides: Partial<React.ComponentProps<typeof BlockItem>> = {}) {
  return {
    block,
    errors: [],
    canMoveUp: true,
    canMoveDown: true,
    onChange: vi.fn(),
    onDelete: vi.fn(),
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    onInsertAfter: vi.fn(),
    ...overrides,
  }
}

describe('BlockItem', () => {
  it('shows marginal heading + content fields for a section block', () => {
    const block: Block = { id: '1', type: 'section', content: '', marginalHeading: '' }
    render(<BlockItem {...baseProps(block)} />)
    expect(screen.getByPlaceholderText('כותרת שוליים')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('תוכן')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('מונח')).not.toBeInTheDocument()
  })

  it('shows term + content fields for a definition block', () => {
    const block: Block = { id: '1', type: 'definition', content: '', term: '' }
    render(<BlockItem {...baseProps(block)} />)
    expect(screen.getByPlaceholderText('מונח')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('תוכן')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('כותרת שוליים')).not.toBeInTheDocument()
  })

  it('shows only content field for chapter/subsection/paragraph/commencement', () => {
    const block: Block = { id: '1', type: 'chapter', content: '' }
    render(<BlockItem {...baseProps(block)} />)
    expect(screen.getByPlaceholderText('תוכן')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('מונח')).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText('כותרת שוליים')).not.toBeInTheDocument()
  })

  it('calls onChange with the typed content', async () => {
    const user = userEvent.setup()
    const block: Block = { id: '1', type: 'chapter', content: '' }
    const onChange = vi.fn()
    render(<BlockItem {...baseProps(block, { onChange })} />)
    await user.type(screen.getByPlaceholderText('תוכן'), 'א')
    expect(onChange).toHaveBeenCalledWith({ content: 'א' })
  })

  it('applies a red border when an error is present', () => {
    const block: Block = { id: '1', type: 'chapter', content: '' }
    const { container } = render(
      <BlockItem {...baseProps(block, { errors: [{ blockId: '1', message: 'x', severity: 'error' }] })} />
    )
    expect(container.firstChild).toHaveClass('border-l-red-500')
  })

  it('applies a yellow border when only a warning is present', () => {
    const block: Block = { id: '1', type: 'chapter', content: '' }
    const { container } = render(
      <BlockItem {...baseProps(block, { errors: [{ blockId: '1', message: 'x', severity: 'warning' }] })} />
    )
    expect(container.firstChild).toHaveClass('border-l-yellow-500')
  })

  it('disables move buttons at boundaries', () => {
    const block: Block = { id: '1', type: 'chapter', content: '' }
    render(<BlockItem {...baseProps(block, { canMoveUp: false, canMoveDown: false })} />)
    expect(screen.getByText('↑')).toBeDisabled()
    expect(screen.getByText('↓')).toBeDisabled()
  })

  it('calls onDelete only after the user confirms', async () => {
    const user = userEvent.setup()
    const block: Block = { id: '1', type: 'chapter', content: '' }
    const onDelete = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<BlockItem {...baseProps(block, { onDelete })} />)
    await user.click(screen.getByText('מחק'))
    expect(confirmSpy).toHaveBeenCalled()
    expect(onDelete).not.toHaveBeenCalled()

    confirmSpy.mockReturnValue(true)
    await user.click(screen.getByText('מחק'))
    expect(onDelete).toHaveBeenCalledTimes(1)
    confirmSpy.mockRestore()
  })

  it('gives the move buttons accessible names', () => {
    const block: Block = { id: '1', type: 'chapter', content: '' }
    render(<BlockItem {...baseProps(block)} />)
    expect(screen.getByLabelText('הזז למעלה')).toBeInTheDocument()
    expect(screen.getByLabelText('הזז למטה')).toBeInTheDocument()
  })

  it('includes an insert-after control inside its own card', async () => {
    const user = userEvent.setup()
    const onInsertAfter = vi.fn()
    const block: Block = { id: '1', type: 'section', marginalHeading: 'x', content: '' }
    render(<BlockItem {...baseProps(block, { onInsertAfter })} />)
    await user.click(screen.getByText('+ הוסף כאן'))
    await user.click(screen.getByText('+ סעיף קטן'))
    expect(onInsertAfter).toHaveBeenCalledWith('subsection')
  })
})
