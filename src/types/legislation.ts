export type DocType =
  | 'new_law'             // חוק חדש
  | 'amending_law'        // חוק מתקן
  | 'regulation'          // תקנות
  | 'order'               // צו
  | 'temporary_provision' // הוראת שעה

export type BlockType =
  | 'chapter'      // כותרת פרק — no number
  | 'section'      // סעיף — numbered 1, 2, 3...
  | 'subsection'   // סעיף קטן — numbered (א), (ב), (ג)...
  | 'paragraph'    // פסקה — numbered (1), (2), (3)...
  | 'definition'   // הגדרה — term + content, no number
  | 'commencement' // תחילה — no number, must be last

export interface Block {
  id: string
  type: BlockType
  content: string
  marginalHeading?: string  // required when type === 'section'
  term?: string             // used when type === 'definition'
}

export interface LegislationDoc {
  id: string
  docType: DocType
  title: string        // e.g. "חוק הגנת הילד, התשפ\"ה-2025"
  year: string         // e.g. "התשפ\"ה"
  blocks: Block[]
  createdAt: string
  updatedAt: string
}

const DOC_TYPES: DocType[] = ['new_law', 'amending_law', 'regulation', 'order', 'temporary_provision']
const BLOCK_TYPES: BlockType[] = ['chapter', 'section', 'subsection', 'paragraph', 'definition', 'commencement']

function isBlock(value: unknown): value is Block {
  if (typeof value !== 'object' || value === null) return false
  const b = value as Record<string, unknown>
  return typeof b.id === 'string' && typeof b.content === 'string' && BLOCK_TYPES.includes(b.type as BlockType)
}

// Runtime shape check for a document loaded from an untrusted .json file —
// a hand-edited or corrupted file must not crash the app on load.
export function isLegislationDoc(value: unknown): value is LegislationDoc {
  if (typeof value !== 'object' || value === null) return false
  const d = value as Record<string, unknown>
  return (
    typeof d.id === 'string' &&
    DOC_TYPES.includes(d.docType as DocType) &&
    typeof d.title === 'string' &&
    typeof d.year === 'string' &&
    typeof d.createdAt === 'string' &&
    typeof d.updatedAt === 'string' &&
    Array.isArray(d.blocks) &&
    d.blocks.every(isBlock)
  )
}
