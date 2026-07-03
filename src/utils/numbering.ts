import type { Block } from '../types/legislation'

const HEBREW_LETTERS = [
  'א','ב','ג','ד','ה','ו','ז','ח','ט','י',
  'יא','יב','יג','יד','טו','טז','יז','יח','יט','כ',
  'כא','כב','כג','כד','כה','כו','כז','כח','כט','ל'
]

export function hebrewLetter(n: number): string {
  return HEBREW_LETTERS[n - 1] ?? String(n)
}

export function computeNumbers(blocks: Block[]): Map<string, string> {
  const map = new Map<string, string>()
  let sectionCount = 0
  let subsectionCount = 0
  let paragraphCount = 0

  for (const block of blocks) {
    switch (block.type) {
      case 'section':
        sectionCount++
        subsectionCount = 0
        paragraphCount = 0
        map.set(block.id, `${sectionCount}.`)
        break
      case 'subsection':
        subsectionCount++
        paragraphCount = 0
        map.set(block.id, `(${hebrewLetter(subsectionCount)})`)
        break
      case 'paragraph':
        paragraphCount++
        map.set(block.id, `(${paragraphCount})`)
        break
      // chapter, definition, commencement: no number
    }
  }

  return map
}
