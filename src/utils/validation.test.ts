import { describe, it, expect } from 'vitest'
import { validate } from './validation'
import type { Block } from '../types/legislation'

function block(type: Block['type'], overrides: Partial<Block> = {}): Block {
  return { id: crypto.randomUUID(), type, content: 'תוכן', ...overrides }
}

function errorsFor(blocks: Block[], id: string) {
  return validate(blocks).filter((e) => e.blockId === id)
}

describe('R1: section must have marginal heading', () => {
  it('errors when missing, empty, or whitespace-only', () => {
    const missing = block('section')
    const empty = block('section', { marginalHeading: '' })
    const whitespace = block('section', { marginalHeading: '   ' })
    for (const b of [missing, empty, whitespace]) {
      expect(errorsFor([b], b.id).some((e) => e.severity === 'error')).toBe(true)
    }
  })

  it('passes with a real heading', () => {
    const b = block('section', { marginalHeading: 'מטרה' })
    expect(errorsFor([b], b.id).some((e) => e.message.includes('כותרת שוליים'))).toBe(false)
  })
})

describe('R2: subsection must follow section, subsection, or definition', () => {
  it('errors as the first block', () => {
    const b = block('subsection')
    expect(errorsFor([b], b.id).length).toBeGreaterThan(0)
  })

  it('errors after a paragraph', () => {
    const prev = block('paragraph')
    const b = block('subsection')
    expect(errorsFor([prev, b], b.id).length).toBeGreaterThan(0)
  })

  it('passes after section, subsection, or definition', () => {
    for (const prevType of ['section', 'subsection', 'definition'] as const) {
      const prev = block(prevType, { marginalHeading: 'x', term: 'x' })
      const b = block('subsection')
      expect(errorsFor([prev, b], b.id).length).toBe(0)
    }
  })
})

describe('R3: paragraph must follow subsection or paragraph', () => {
  it('errors as the first block', () => {
    const b = block('paragraph')
    expect(errorsFor([b], b.id).length).toBeGreaterThan(0)
  })

  it('errors after a section', () => {
    const prev = block('section', { marginalHeading: 'x' })
    const b = block('paragraph')
    expect(errorsFor([prev, b], b.id).length).toBeGreaterThan(0)
  })

  it('passes after subsection or paragraph', () => {
    for (const prevType of ['subsection', 'paragraph'] as const) {
      const prev = block(prevType)
      const b = block('paragraph')
      expect(errorsFor([prev, b], b.id).length).toBe(0)
    }
  })
})

describe('R4: commencement must be the last block', () => {
  it('errors when not last', () => {
    const b = block('commencement')
    const after = block('section', { marginalHeading: 'x' })
    expect(errorsFor([b, after], b.id).length).toBeGreaterThan(0)
  })

  it('passes when last', () => {
    const before = block('section', { marginalHeading: 'x' })
    const b = block('commencement')
    expect(errorsFor([before, b], b.id).length).toBe(0)
  })
})

describe('R5: warn on empty content', () => {
  it('warns for empty/whitespace content on non-commencement types', () => {
    const b = block('chapter', { content: '   ' })
    const errs = errorsFor([b], b.id)
    expect(errs.some((e) => e.severity === 'warning')).toBe(true)
  })

  it('does not warn for empty content on commencement', () => {
    const b = block('commencement', { content: '' })
    const errs = errorsFor([b], b.id)
    expect(errs.some((e) => e.severity === 'warning')).toBe(false)
  })
})

describe('R6: definition must have a term', () => {
  it('errors when term missing or whitespace-only', () => {
    const missing = block('definition')
    const whitespace = block('definition', { term: '  ' })
    for (const b of [missing, whitespace]) {
      expect(errorsFor([b], b.id).some((e) => e.severity === 'error')).toBe(true)
    }
  })

  it('passes with a real term', () => {
    const b = block('definition', { term: 'ילד' })
    expect(errorsFor([b], b.id).some((e) => e.message.includes('מונח'))).toBe(false)
  })
})

describe('template smoke test', () => {
  it('produces zero errors (warnings allowed) for a well-formed document', () => {
    const blocks: Block[] = [
      block('section', { marginalHeading: 'מטרה', content: 'חוק זה מטרתו...' }),
      block('section', { marginalHeading: 'הגדרות', content: 'בחוק זה —' }),
      block('definition', { term: 'ילד', content: 'אדם שטרם מלאו לו 18 שנים' }),
      block('commencement', { content: 'חוק זה ייכנס לתוקף ביום פרסומו ברשומות.' }),
    ]
    const errors = validate(blocks)
    expect(errors.filter((e) => e.severity === 'error')).toHaveLength(0)
  })
})
