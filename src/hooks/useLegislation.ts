import { useEffect, useMemo, useReducer, useRef } from 'react'
import type { Block, BlockType, DocType, LegislationDoc } from '../types/legislation'
import { computeNumbers } from '../utils/numbering'
import { validate } from '../utils/validation'

type Action =
  | { type: 'ADD_BLOCK'; blockType: BlockType; afterId?: string }
  | { type: 'UPDATE_BLOCK'; id: string; changes: Partial<Block> }
  | { type: 'DELETE_BLOCK'; id: string }
  | { type: 'MOVE_BLOCK'; id: string; direction: 'up' | 'down' }
  | { type: 'SET_META'; changes: Partial<Pick<LegislationDoc, 'title' | 'docType' | 'year'>> }
  | { type: 'LOAD_DOC'; doc: LegislationDoc }
  | { type: 'NEW_DOC'; docType: DocType }

function newBlock(type: BlockType): Block {
  return { id: crypto.randomUUID(), type, content: '' }
}

function newLawTemplate(): Block[] {
  return [
    { ...newBlock('section'), marginalHeading: 'מטרה', content: '' },
    { ...newBlock('section'), marginalHeading: 'הגדרות', content: 'בחוק זה —' },
    { ...newBlock('commencement'), content: 'חוק זה ייכנס לתוקף ביום פרסומו ברשומות.' },
  ]
}

function regulationTemplate(): Block[] {
  return [
    { ...newBlock('section'), marginalHeading: 'הגדרות', content: 'בתקנות אלה —' },
    { ...newBlock('commencement'), content: 'תקנות אלה ייכנסו לתוקף ביום פרסומן ברשומות.' },
  ]
}

// Phase 1 templates only cover new_law / regulation / blank (see spec's
// "Document Templates" section). amending_law reuses new_law's blocks;
// order / temporary_provision have no dedicated template and start blank.
function blocksForDocType(docType: DocType): Block[] {
  switch (docType) {
    case 'new_law':
    case 'amending_law':
      return newLawTemplate()
    case 'regulation':
      return regulationTemplate()
    case 'order':
    case 'temporary_provision':
      return []
  }
}

export function createEmptyDoc(docType: DocType = 'new_law'): LegislationDoc {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    docType,
    title: '',
    year: '',
    blocks: blocksForDocType(docType),
    createdAt: now,
    updatedAt: now,
  }
}

function reducer(doc: LegislationDoc, action: Action): LegislationDoc {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'ADD_BLOCK': {
      const block = newBlock(action.blockType)
      const blocks = [...doc.blocks]
      if (action.afterId) {
        const index = blocks.findIndex((b) => b.id === action.afterId)
        blocks.splice(index + 1, 0, block)
      } else {
        blocks.push(block)
      }
      return { ...doc, blocks, updatedAt: now }
    }

    case 'UPDATE_BLOCK': {
      const blocks = doc.blocks.map((b) => (b.id === action.id ? { ...b, ...action.changes } : b))
      return { ...doc, blocks, updatedAt: now }
    }

    case 'DELETE_BLOCK': {
      const blocks = doc.blocks.filter((b) => b.id !== action.id)
      return { ...doc, blocks, updatedAt: now }
    }

    case 'MOVE_BLOCK': {
      const index = doc.blocks.findIndex((b) => b.id === action.id)
      const targetIndex = action.direction === 'up' ? index - 1 : index + 1
      if (index === -1 || targetIndex < 0 || targetIndex >= doc.blocks.length) {
        return doc
      }
      const blocks = [...doc.blocks]
      ;[blocks[index], blocks[targetIndex]] = [blocks[targetIndex], blocks[index]]
      return { ...doc, blocks, updatedAt: now }
    }

    case 'SET_META': {
      return { ...doc, ...action.changes, updatedAt: now }
    }

    case 'LOAD_DOC': {
      return action.doc
    }

    case 'NEW_DOC': {
      return createEmptyDoc(action.docType)
    }
  }
}

export function useLegislation() {
  const [doc, dispatch] = useReducer(reducer, undefined, () => createEmptyDoc())
  const numbers = useMemo(() => computeNumbers(doc.blocks), [doc.blocks])
  const errors = useMemo(() => validate(doc.blocks), [doc.blocks])

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(doc.id, JSON.stringify(doc))
    }, 30000)
    return () => clearInterval(interval)
  }, [doc])

  // Autosave only ever writes — there is no restore-on-load in Phase 1, so a
  // refresh/close silently discards any unsaved work. Warn before that happens.
  const docRef = useRef(doc)
  docRef.current = doc
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (docRef.current.blocks.length > 0) {
        e.preventDefault()
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return { doc, numbers, errors, dispatch }
}
