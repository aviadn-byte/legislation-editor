import type { Block, BlockType } from '../types/legislation'
import type { ValidationError } from '../utils/validation'
import { AddBlockBar } from './AddBlockBar'

const BLOCK_LABELS: Record<BlockType, string> = {
  chapter: 'פרק',
  section: 'סעיף',
  subsection: 'סעיף קטן',
  paragraph: 'פסקה',
  definition: 'הגדרה',
  commencement: 'תחילה',
}

export interface BlockItemProps {
  block: Block
  number?: string
  errors: ValidationError[]
  canMoveUp: boolean
  canMoveDown: boolean
  onChange: (changes: Partial<Block>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onInsertAfter: (blockType: BlockType) => void
}

export function BlockItem({
  block,
  number,
  errors,
  canMoveUp,
  canMoveDown,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onInsertAfter,
}: BlockItemProps) {
  const severity = errors.some((e) => e.severity === 'error')
    ? 'error'
    : errors.some((e) => e.severity === 'warning')
      ? 'warning'
      : null

  const borderClass =
    severity === 'error' ? 'border-l-4 border-l-red-500' : severity === 'warning' ? 'border-l-4 border-l-yellow-500' : 'border-l-4 border-l-transparent'

  return (
    <div data-block-id={block.id} className={`flex flex-col gap-2 rounded border border-gray-200 bg-white p-3 ${borderClass}`}>
      <div className="flex items-center justify-between">
        <span className="rounded bg-gray-100 px-2 py-0.5 text-sm font-semibold text-gray-700">
          {BLOCK_LABELS[block.type]}
        </span>
        <div className="flex items-center gap-2">
          {number && <span className="font-mono text-sm text-gray-500">{number}</span>}
          <button type="button" onClick={onMoveUp} disabled={!canMoveUp} aria-label="הזז למעלה" className="disabled:opacity-30">
            ↑
          </button>
          <button type="button" onClick={onMoveDown} disabled={!canMoveDown} aria-label="הזז למטה" className="disabled:opacity-30">
            ↓
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`למחוק את הבלוק "${BLOCK_LABELS[block.type]}"? לא ניתן לשחזר פעולה זו.`)) onDelete()
            }}
            className="text-red-600"
          >
            מחק
          </button>
        </div>
      </div>

      {block.type === 'section' && (
        <input
          type="text"
          value={block.marginalHeading ?? ''}
          onChange={(e) => onChange({ marginalHeading: e.target.value })}
          placeholder="כותרת שוליים"
          className="rounded border border-gray-300 px-2 py-1 text-sm font-semibold"
        />
      )}

      {block.type === 'definition' && (
        <input
          type="text"
          value={block.term ?? ''}
          onChange={(e) => onChange({ term: e.target.value })}
          placeholder="מונח"
          className="rounded border border-gray-300 px-2 py-1 text-sm font-semibold"
        />
      )}

      <textarea
        value={block.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="תוכן"
        rows={2}
        className="resize-y rounded border border-gray-300 px-2 py-1 text-sm"
      />

      {errors.length > 0 && (
        <ul className="space-y-0.5 text-xs">
          {errors.map((e, i) => (
            <li key={i} className={e.severity === 'error' ? 'text-red-600' : 'text-yellow-700'}>
              {e.message}
            </li>
          ))}
        </ul>
      )}

      <div className="-mx-3 -mb-3 border-t border-gray-100 px-3 pt-1.5 pb-1.5">
        <AddBlockBar compact lastBlock={block} onAdd={onInsertAfter} />
      </div>
    </div>
  )
}
