import type { Block } from '../types/legislation'

export interface ValidationError {
  blockId: string
  message: string
  severity: 'error' | 'warning'
}

export function validate(blocks: Block[]): ValidationError[] {
  const errors: ValidationError[] = []

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const prev = blocks[i - 1]

    // R1: section must have marginal heading
    if (block.type === 'section' && !block.marginalHeading?.trim()) {
      errors.push({ blockId: block.id, message: 'לכל סעיף חייבת כותרת שוליים', severity: 'error' })
    }

    // R2: subsection must follow section, subsection, or definition
    if (block.type === 'subsection') {
      const validPrev = ['section', 'subsection', 'definition']
      if (!prev || !validPrev.includes(prev.type)) {
        errors.push({ blockId: block.id, message: 'סעיף קטן חייב להופיע אחרי סעיף', severity: 'error' })
      }
    }

    // R3: paragraph must follow subsection or paragraph
    if (block.type === 'paragraph') {
      if (!prev || !['subsection', 'paragraph'].includes(prev.type)) {
        errors.push({ blockId: block.id, message: 'פסקה חייבת להופיע אחרי סעיף קטן', severity: 'error' })
      }
    }

    // R4: commencement must be the last block
    if (block.type === 'commencement' && i !== blocks.length - 1) {
      errors.push({ blockId: block.id, message: 'סעיף תחילה חייב להיות האחרון במסמך', severity: 'error' })
    }

    // R5: warn on empty content
    if (!block.content.trim() && block.type !== 'commencement') {
      errors.push({ blockId: block.id, message: 'בלוק ריק', severity: 'warning' })
    }

    // R6: definition must have a term
    if (block.type === 'definition' && !block.term?.trim()) {
      errors.push({ blockId: block.id, message: 'הגדרה חייבת מונח', severity: 'error' })
    }
  }

  return errors
}
