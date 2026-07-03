import { useState } from 'react'
import type { Block, BlockType } from '../types/legislation'

export interface AddBlockBarProps {
  lastBlock: Block | undefined
  onAdd: (blockType: BlockType) => void
  // Renders as a small collapsed "+" that expands on click, for inline
  // insertion points between existing blocks (see BlockList).
  compact?: boolean
}

const SUBSECTION_VALID_PREV: BlockType[] = ['section', 'subsection', 'definition']
const PARAGRAPH_VALID_PREV: BlockType[] = ['subsection', 'paragraph']

export function AddBlockBar({ lastBlock, onAdd, compact = false }: AddBlockBarProps) {
  const [expanded, setExpanded] = useState(!compact)
  const subsectionDisabled = !lastBlock || !SUBSECTION_VALID_PREV.includes(lastBlock.type)
  const paragraphDisabled = !lastBlock || !PARAGRAPH_VALID_PREV.includes(lastBlock.type)

  if (compact && !expanded) {
    return (
      <div className="flex justify-center py-0.5">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label="הוסף בלוק בנקודה זו"
          className="rounded px-2 text-xs text-gray-300 hover:bg-gray-100 hover:text-blue-600"
        >
          + הוסף כאן
        </button>
      </div>
    )
  }

  function handleAdd(blockType: BlockType) {
    onAdd(blockType)
    if (compact) setExpanded(false)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => handleAdd('chapter')}>
        + פרק
      </button>
      <button type="button" onClick={() => handleAdd('section')}>
        + סעיף
      </button>
      <button type="button" onClick={() => handleAdd('subsection')} disabled={subsectionDisabled} className="disabled:opacity-30">
        + סעיף קטן
      </button>
      <button type="button" onClick={() => handleAdd('paragraph')} disabled={paragraphDisabled} className="disabled:opacity-30">
        + פסקה
      </button>
      <button type="button" onClick={() => handleAdd('definition')}>
        + הגדרה
      </button>
      <button type="button" onClick={() => handleAdd('commencement')}>
        + תחילה
      </button>
      {compact && (
        <button type="button" onClick={() => setExpanded(false)} className="text-xs text-gray-400">
          ביטול
        </button>
      )}
    </div>
  )
}
