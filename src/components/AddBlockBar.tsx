import type { Block, BlockType } from '../types/legislation'

export interface AddBlockBarProps {
  lastBlock: Block | undefined
  onAdd: (blockType: BlockType) => void
}

const SUBSECTION_VALID_PREV: BlockType[] = ['section', 'subsection', 'definition']
const PARAGRAPH_VALID_PREV: BlockType[] = ['subsection', 'paragraph']

export function AddBlockBar({ lastBlock, onAdd }: AddBlockBarProps) {
  const subsectionDisabled = !lastBlock || !SUBSECTION_VALID_PREV.includes(lastBlock.type)
  const paragraphDisabled = !lastBlock || !PARAGRAPH_VALID_PREV.includes(lastBlock.type)

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => onAdd('chapter')}>
        + פרק
      </button>
      <button type="button" onClick={() => onAdd('section')}>
        + סעיף
      </button>
      <button type="button" onClick={() => onAdd('subsection')} disabled={subsectionDisabled} className="disabled:opacity-30">
        + סעיף קטן
      </button>
      <button type="button" onClick={() => onAdd('paragraph')} disabled={paragraphDisabled} className="disabled:opacity-30">
        + פסקה
      </button>
      <button type="button" onClick={() => onAdd('definition')}>
        + הגדרה
      </button>
      <button type="button" onClick={() => onAdd('commencement')}>
        + תחילה
      </button>
    </div>
  )
}
