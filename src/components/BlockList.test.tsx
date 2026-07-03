import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BlockList } from './BlockList'
import type { Block } from '../types/legislation'

function baseProps(overrides: Partial<React.ComponentProps<typeof BlockList>> = {}) {
  return {
    blocks: [] as Block[],
    numbers: new Map<string, string>(),
    errors: [],
    onChange: vi.fn(),
    onDelete: vi.fn(),
    onMove: vi.fn(),
    onInsertAfter: vi.fn(),
    ...overrides,
  }
}

describe('BlockList', () => {
  it('renders one inline insert point after each block', () => {
    const blocks: Block[] = [
      { id: '1', type: 'chapter', content: 'a' },
      { id: '2', type: 'chapter', content: 'b' },
    ]
    render(<BlockList {...baseProps({ blocks })} />)
    expect(screen.getAllByText('+ הוסף כאן')).toHaveLength(2)
  })

  it('inserts a new block after the correct existing block', async () => {
    const user = userEvent.setup()
    const onInsertAfter = vi.fn()
    const blocks: Block[] = [
      { id: '1', type: 'chapter', content: 'a' },
      { id: '2', type: 'chapter', content: 'b' },
    ]
    render(<BlockList {...baseProps({ blocks, onInsertAfter })} />)

    const insertTriggers = screen.getAllByText('+ הוסף כאן')
    await user.click(insertTriggers[0])
    await user.click(screen.getByText('+ סעיף'))

    expect(onInsertAfter).toHaveBeenCalledWith('1', 'section')
  })
})
