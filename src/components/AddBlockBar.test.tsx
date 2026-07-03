import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddBlockBar } from './AddBlockBar'
import type { Block } from '../types/legislation'

describe('AddBlockBar', () => {
  it('disables subsection and paragraph when there is no last block', () => {
    render(<AddBlockBar lastBlock={undefined} onAdd={vi.fn()} />)
    expect(screen.getByText('+ סעיף קטן')).toBeDisabled()
    expect(screen.getByText('+ פסקה')).toBeDisabled()
  })

  it('enables subsection after section/subsection/definition', () => {
    for (const type of ['section', 'subsection', 'definition'] as const) {
      const block: Block = { id: '1', type, content: '' }
      const { unmount } = render(<AddBlockBar lastBlock={block} onAdd={vi.fn()} />)
      expect(screen.getByText('+ סעיף קטן')).not.toBeDisabled()
      unmount()
    }
  })

  it('disables subsection after paragraph or chapter', () => {
    for (const type of ['paragraph', 'chapter'] as const) {
      const block: Block = { id: '1', type, content: '' }
      const { unmount } = render(<AddBlockBar lastBlock={block} onAdd={vi.fn()} />)
      expect(screen.getByText('+ סעיף קטן')).toBeDisabled()
      unmount()
    }
  })

  it('enables paragraph after subsection/paragraph, disables otherwise', () => {
    const enabled: Block = { id: '1', type: 'subsection', content: '' }
    render(<AddBlockBar lastBlock={enabled} onAdd={vi.fn()} />)
    expect(screen.getByText('+ פסקה')).not.toBeDisabled()
  })

  it('calls onAdd with the right blockType', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    render(<AddBlockBar lastBlock={undefined} onAdd={onAdd} />)
    await user.click(screen.getByText('+ פרק'))
    expect(onAdd).toHaveBeenCalledWith('chapter')
    await user.click(screen.getByText('+ תחילה'))
    expect(onAdd).toHaveBeenCalledWith('commencement')
  })
})
