import {
  Document, Table, TableRow, TableCell, Paragraph, TextRun,
  WidthType, AlignmentType, BorderStyle, TableLayoutType, Packer
} from 'docx'
import type { LegislationDoc, Block, BlockType } from '../types/legislation'
import { computeNumbers } from '../utils/numbering'

const DAVID_FONT = 'David'
const FONT_HALF_POINTS = 24  // = 12pt

export async function exportToDocx(doc: LegislationDoc): Promise<Blob> {
  const numbers = computeNumbers(doc.blocks)
  const rows = doc.blocks.map(block =>
    buildRow(block, numbers.get(block.id) ?? '')
  )

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows,
    borders: {
      top:     { style: BorderStyle.SINGLE, size: 1 },
      bottom:  { style: BorderStyle.SINGLE, size: 1 },
      left:    { style: BorderStyle.SINGLE, size: 1 },
      right:   { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    }
  })

  const titlePara = new Paragraph({
    children: [new TextRun({
      text: doc.title,
      bold: true,
      size: 28,
      font: DAVID_FONT,
      rightToLeft: true,
    })],
    alignment: AlignmentType.CENTER,
    bidirectional: true,
    spacing: { after: 200 }
  })

  const wordDoc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1134, bottom: 1134, left: 1417, right: 1134 }
        }
      },
      children: [titlePara, table]
    }]
  })

  return Packer.toBlob(wordDoc)
}

// Splits on \n and renders each line as a separate TextRun with a leading
// line break, so multi-line content stays inside a single Paragraph/cell
// instead of spawning extra paragraphs or table rows (Absolute Rule #5).
function textRunsWithBreaks(text: string, bold = false): TextRun[] {
  return text.split('\n').map((line, i) =>
    new TextRun({
      text: line,
      font: DAVID_FONT,
      size: FONT_HALF_POINTS,
      bold,
      rightToLeft: true,
      break: i > 0 ? 1 : undefined,
    })
  )
}

function contentPara(
  text: string,
  opts: { bold?: boolean; indentTwips?: number; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType] } = {}
): Paragraph {
  return new Paragraph({
    children: textRunsWithBreaks(text, opts.bold),
    bidirectional: true,
    alignment: opts.alignment ?? AlignmentType.RIGHT,
    indent: opts.indentTwips ? { start: opts.indentTwips } : undefined,
  })
}

const INDENT_TWIPS: Partial<Record<BlockType, number>> = {
  subsection: 360,
  paragraph: 720,
  definition: 360,
}

function buildRow(block: Block, number: string): TableRow {
  return block.type === 'chapter' ? buildChapterRow(block) : buildContentRow(block, number)
}

// Chapter titles render as a single row spanning the full table width,
// matching the real Reshumot table layout (confirmed against the HakikaV16
// guide's sample table) rather than the 3-cell layout used by other blocks.
function buildChapterRow(block: Block): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: 3,
        width: { size: 100, type: WidthType.PERCENTAGE },
        children: [contentPara(block.content, { bold: true, alignment: AlignmentType.CENTER })],
      }),
    ],
  })
}

function buildContentRow(block: Block, number: string): TableRow {
  const indent = INDENT_TWIPS[block.type] ?? 0

  let contentText = block.content
  if (block.type === 'definition' && block.term) {
    contentText = `"${block.term}" — ${block.content}`
  }

  return new TableRow({
    children: [
      // Column 1 (right in RTL): marginal heading — only for section
      new TableCell({
        width: { size: 22, type: WidthType.PERCENTAGE },
        children: [contentPara(block.type === 'section' ? (block.marginalHeading ?? '') : '', { bold: true })],
      }),
      // Column 2: auto-number
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        children: [contentPara(number)],
      }),
      // Column 3: content
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [contentPara(contentText, { indentTwips: indent })],
      }),
    ]
  })
}

export function downloadDocx(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
