import { describe, it, expect } from 'vitest'
import JSZip from 'jszip'
import { exportToDocx } from './docxExport'
import type { Block, LegislationDoc } from '../types/legislation'

function makeDoc(blocks: Block[]): LegislationDoc {
  const now = new Date().toISOString()
  return {
    id: 'test-doc',
    docType: 'new_law',
    title: 'חוק לדוגמה, התשפ"ה-2025',
    year: 'התשפ"ה',
    blocks,
    createdAt: now,
    updatedAt: now,
  }
}

async function getDocumentXml(blob: Blob): Promise<string> {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer())
  const file = zip.file('word/document.xml')
  if (!file) throw new Error('word/document.xml missing from generated docx')
  return file.async('string')
}

describe('exportToDocx', () => {
  it('resolves to a non-empty Word blob', async () => {
    const blob = await exportToDocx(makeDoc([{ id: '1', type: 'section', content: 'x', marginalHeading: 'y' }]))
    expect(blob.size).toBeGreaterThan(0)
    expect(blob.type).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  })

  it('merges a chapter row across all 3 columns via gridSpan', async () => {
    const blob = await exportToDocx(makeDoc([{ id: '1', type: 'chapter', content: 'פרק א' }]))
    const xml = await getDocumentXml(blob)
    expect(xml).toContain('w:gridSpan')
    expect(xml).toMatch(/w:gridSpan w:val="3"/)
  })

  it('renders multi-line content as in-cell line breaks, not extra rows', async () => {
    const blocks: Block[] = [
      { id: '1', type: 'section', content: 'a\nb\nc', marginalHeading: 'x' },
    ]
    const blob = await exportToDocx(makeDoc(blocks))
    const xml = await getDocumentXml(blob)
    const rowCount = (xml.match(/<w:tr[ >]/g) ?? []).length
    const breakCount = (xml.match(/<w:br\/>/g) ?? []).length
    expect(rowCount).toBe(1)
    expect(breakCount).toBe(2)
  })

  it('produces one table row per block', async () => {
    const blocks: Block[] = [
      { id: '1', type: 'chapter', content: 'פרק א' },
      { id: '2', type: 'section', content: 'תוכן', marginalHeading: 'מטרה' },
      { id: '3', type: 'subsection', content: 'תוכן' },
      { id: '4', type: 'definition', content: 'הגדרה', term: 'ילד' },
      { id: '5', type: 'commencement', content: 'תחילה' },
    ]
    const blob = await exportToDocx(makeDoc(blocks))
    const xml = await getDocumentXml(blob)
    const rowCount = (xml.match(/<w:tr[ >]/g) ?? []).length
    expect(rowCount).toBe(blocks.length)
  })

  it('uses the David font throughout', async () => {
    const blob = await exportToDocx(makeDoc([{ id: '1', type: 'chapter', content: 'x' }]))
    const xml = await getDocumentXml(blob)
    expect(xml).toContain('w:ascii="David"')
  })
})
