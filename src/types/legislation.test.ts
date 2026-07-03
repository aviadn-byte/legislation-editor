import { describe, it, expect } from 'vitest'
import { isLegislationDoc } from './legislation'

function validDoc() {
  return {
    id: '1',
    docType: 'new_law',
    title: 'x',
    year: 'y',
    blocks: [{ id: 'b1', type: 'section', content: 'c', marginalHeading: 'h' }],
    createdAt: 'now',
    updatedAt: 'now',
  }
}

describe('isLegislationDoc', () => {
  it('accepts a well-formed document', () => {
    expect(isLegislationDoc(validDoc())).toBe(true)
  })

  it('accepts a document with an empty blocks array', () => {
    expect(isLegislationDoc({ ...validDoc(), blocks: [] })).toBe(true)
  })

  it('rejects null/non-object input', () => {
    expect(isLegislationDoc(null)).toBe(false)
    expect(isLegislationDoc('a string')).toBe(false)
    expect(isLegislationDoc(42)).toBe(false)
  })

  it('rejects a missing required field', () => {
    const { title: _title, ...rest } = validDoc()
    expect(isLegislationDoc(rest)).toBe(false)
  })

  it('rejects an invalid docType', () => {
    expect(isLegislationDoc({ ...validDoc(), docType: 'not_a_real_type' })).toBe(false)
  })

  it('rejects a block with an invalid type', () => {
    const doc = validDoc()
    doc.blocks = [{ id: 'b1', type: 'not_a_real_block_type', content: 'c' } as never]
    expect(isLegislationDoc(doc)).toBe(false)
  })

  it('rejects blocks that is not an array', () => {
    expect(isLegislationDoc({ ...validDoc(), blocks: 'not-an-array' })).toBe(false)
  })
})
