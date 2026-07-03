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
