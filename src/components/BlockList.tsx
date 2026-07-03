import type { Block, BlockType } from '../types/legislation'
import type { ValidationError } from '../utils/validation'
import { BlockItem } from './BlockItem'
import { AddBlockBar } from './AddBlockBar'

export interface BlockListProps {
  blocks: Block[]
  numbers: Map<string, string>
  errors: ValidationError[]
  onChange: (id: string, changes: Partial<Block>) => void
  onDelete: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
  onInsertAfter: (afterId: string, blockType: BlockType) => void
}

export function BlockList({ blocks, numbers, errors, onChange, onDelete, onMove, onInsertAfter }: BlockListProps) {
  return (
    <div className="flex flex-col gap-1">
      {blocks.map((block, index) => (
        <div key={block.id} className="flex flex-col gap-1">
          <BlockItem
            block={block}
            number={numbers.get(block.id)}
            errors={errors.filter((e) => e.blockId === block.id)}
            canMoveUp={index > 0}
            canMoveDown={index < blocks.length - 1}
            onChange={(changes) => onChange(block.id, changes)}
            onDelete={() => onDelete(block.id)}
            onMoveUp={() => onMove(block.id, 'up')}
            onMoveDown={() => onMove(block.id, 'down')}
          />
          <AddBlockBar compact lastBlock={block} onAdd={(blockType) => onInsertAfter(block.id, blockType)} />
        </div>
      ))}
    </div>
  )
}
