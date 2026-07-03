import { describe, it, expect } from 'vitest'
import { hebrewLetter, computeNumbers } from './numbering'
import type { Block } from '../types/legislation'

function block(type: Block['type'], overrides: Partial<Block> = {}): Block {
  return { id: crypto.randomUUID(), type, content: 'x', ...overrides }
}

describe('hebrewLetter', () => {
  it('maps 1 to א and 30 to ל', () => {
    expect(hebrewLetter(1)).toBe('א')
    expect(hebrewLetter(30)).toBe('ל')
  })

  it('falls back to the numeric string past 30', () => {
    expect(hebrewLetter(31)).toBe('31')
  })
})

describe('computeNumbers', () => {
  it('numbers sections sequentially in a flat list', () => {
    const blocks = [block('section'), block('section'), block('section')]
    const numbers = computeNumbers(blocks)
    expect(numbers.get(blocks[0].id)).toBe('1.')
    expect(numbers.get(blocks[1].id)).toBe('2.')
    expect(numbers.get(blocks[2].id)).toBe('3.')
  })

  it('keeps section numbering continuous across chapters', () => {
    const blocks = [
      block('chapter'),
      block('section'),
      block('chapter'),
      block('section'),
    ]
    const numbers = computeNumbers(blocks)
    expect(numbers.get(blocks[1].id)).toBe('1.')
    expect(numbers.get(blocks[3].id)).toBe('2.')
  })

  it('resets subsection count on each new section', () => {
    const blocks = [
      block('section'),
      block('subsection'),
      block('subsection'),
      block('section'),
      block('subsection'),
    ]
    const numbers = computeNumbers(blocks)
    expect(numbers.get(blocks[1].id)).toBe('(א)')
    expect(numbers.get(blocks[2].id)).toBe('(ב)')
    expect(numbers.get(blocks[4].id)).toBe('(א)')
  })

  it('resets paragraph count on each new subsection', () => {
    const blocks = [
      block('section'),
      block('subsection'),
      block('paragraph'),
      block('paragraph'),
      block('subsection'),
      block('paragraph'),
    ]
    const numbers = computeNumbers(blocks)
    expect(numbers.get(blocks[2].id)).toBe('(1)')
    expect(numbers.get(blocks[3].id)).toBe('(2)')
    expect(numbers.get(blocks[5].id)).toBe('(1)')
  })

  it('does not number chapter, definition, or commencement blocks', () => {
    const blocks = [block('chapter'), block('definition'), block('commencement')]
    const numbers = computeNumbers(blocks)
    for (const b of blocks) {
      expect(numbers.get(b.id)).toBeUndefined()
    }
  })

  it('falls back to a numeric label past 30 subsections in one section', () => {
    const blocks = [block('section'), ...Array.from({ length: 31 }, () => block('subsection'))]
    const numbers = computeNumbers(blocks)
    expect(numbers.get(blocks[31].id)).toBe('(31)')
  })
})
