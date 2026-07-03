import type { Block } from '../types/legislation'
import type { ValidationError } from '../utils/validation'
import { BlockItem } from './BlockItem'

export interface BlockListProps {
  blocks: Block[]
  numbers: Map<string, string>
  errors: ValidationError[]
  onChange: (id: string, changes: Partial<Block>) => void
  onDelete: (id: string) => void
  onMove: (id: string, direction: 'up' | 'down') => void
}

export function BlockList({ blocks, numbers, errors, onChange, onDelete, onMove }: BlockListProps) {
  return (
    <div className="flex flex-col gap-2">
      {blocks.map((block, index) => (
        <BlockItem
          key={block.id}
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
      ))}
    </div>
  )
}
