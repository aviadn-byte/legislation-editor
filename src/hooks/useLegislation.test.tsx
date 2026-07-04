import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useLegislation } from './useLegislation'

const AUTOSAVE_KEY = 'legislation-editor-autosave'

describe('useLegislation reducer', () => {
  it('ADD_BLOCK appends at the end by default', () => {
    const { result } = renderHook(() => useLegislation())
    act(() => result.current.dispatch({ type: 'NEW_DOC', docType: 'order' }))
    act(() => result.current.dispatch({ type: 'ADD_BLOCK', blockType: 'section' }))
    expect(result.current.doc.blocks).toHaveLength(1)
    expect(result.current.doc.blocks[0].type).toBe('section')
  })

  it('ADD_BLOCK inserts after the given id', () => {
    const { result } = renderHook(() => useLegislation())
    act(() => result.current.dispatch({ type: 'NEW_DOC', docType: 'order' }))
    act(() => result.current.dispatch({ type: 'ADD_BLOCK', blockType: 'section' }))
    const firstId = result.current.doc.blocks[0].id
    act(() => result.current.dispatch({ type: 'ADD_BLOCK', blockType: 'chapter', afterId: firstId }))
    act(() => result.current.dispatch({ type: 'ADD_BLOCK', blockType: 'subsection', afterId: firstId }))
    expect(result.current.doc.blocks.map((b) => b.type)).toEqual(['section', 'subsection', 'chapter'])
  })

  it('UPDATE_BLOCK patches only the targeted block', () => {
    const { result } = renderHook(() => useLegislation())
    act(() => result.current.dispatch({ type: 'NEW_DOC', docType: 'order' }))
    act(() => result.current.dispatch({ type: 'ADD_BLOCK', blockType: 'section' }))
    const id = result.current.doc.blocks[0].id
    act(() => result.current.dispatch({ type: 'UPDATE_BLOCK', id, changes: { content: 'hello' } }))
    expect(result.current.doc.blocks[0].content).toBe('hello')
  })

  it('DELETE_BLOCK removes the block and renumbers subsequent sections', () => {
    const { result } = renderHook(() => useLegislation())
    act(() => result.current.dispatch({ type: 'NEW_DOC', docType: 'order' }))
    act(() => result.current.dispatch({ type: 'ADD_BLOCK', blockType: 'section' }))
    act(() => result.current.dispatch({ type: 'ADD_BLOCK', blockType: 'section' }))
    const firstId = result.current.doc.blocks[0].id
    const secondId = result.current.doc.blocks[1].id
    expect(result.current.numbers.get(secondId)).toBe('2.')
    act(() => result.current.dispatch({ type: 'DELETE_BLOCK', id: firstId }))
    expect(result.current.doc.blocks).toHaveLength(1)
    expect(result.current.numbers.get(secondId)).toBe('1.')
  })

  it('MOVE_BLOCK swaps neighbors and no-ops at boundaries', () => {
    const { result } = renderHook(() => useLegislation())
    act(() => result.current.dispatch({ type: 'NEW_DOC', docType: 'order' }))
    act(() => result.current.dispatch({ type: 'ADD_BLOCK', blockType: 'section' }))
    act(() => result.current.dispatch({ type: 'ADD_BLOCK', blockType: 'chapter' }))
    const [firstId, secondId] = result.current.doc.blocks.map((b) => b.id)

    act(() => result.current.dispatch({ type: 'MOVE_BLOCK', id: firstId, direction: 'up' }))
    expect(result.current.doc.blocks.map((b) => b.id)).toEqual([firstId, secondId])

    act(() => result.current.dispatch({ type: 'MOVE_BLOCK', id: secondId, direction: 'down' }))
    expect(result.current.doc.blocks.map((b) => b.id)).toEqual([firstId, secondId])

    act(() => result.current.dispatch({ type: 'MOVE_BLOCK', id: firstId, direction: 'down' }))
    expect(result.current.doc.blocks.map((b) => b.id)).toEqual([secondId, firstId])
  })

  it('SET_META only touches title/docType/year', () => {
    const { result } = renderHook(() => useLegislation())
    act(() => result.current.dispatch({ type: 'NEW_DOC', docType: 'order' }))
    act(() => result.current.dispatch({ type: 'ADD_BLOCK', blockType: 'section' }))
    act(() => result.current.dispatch({ type: 'SET_META', changes: { title: 'חוק לדוגמה' } }))
    expect(result.current.doc.title).toBe('חוק לדוגמה')
    expect(result.current.doc.blocks).toHaveLength(1)
  })

  it('LOAD_DOC fully replaces the document', () => {
    const { result } = renderHook(() => useLegislation())
    const originalId = result.current.doc.id
    const loaded = {
      id: 'custom-id',
      docType: 'regulation' as const,
      title: 'נטען',
      year: 'התשפ"ה',
      blocks: [],
      createdAt: 'x',
      updatedAt: 'y',
    }
    act(() => result.current.dispatch({ type: 'LOAD_DOC', doc: loaded }))
    expect(result.current.doc).toEqual(loaded)
    expect(result.current.doc.id).not.toBe(originalId)
  })

  it('NEW_DOC produces the correct block set per docType', () => {
    const { result } = renderHook(() => useLegislation())

    act(() => result.current.dispatch({ type: 'NEW_DOC', docType: 'new_law' }))
    expect(result.current.doc.blocks.map((b) => b.type)).toEqual(['section', 'section', 'commencement'])

    act(() => result.current.dispatch({ type: 'NEW_DOC', docType: 'amending_law' }))
    expect(result.current.doc.blocks.map((b) => b.type)).toEqual(['section', 'section', 'commencement'])
    expect(result.current.doc.docType).toBe('amending_law')

    act(() => result.current.dispatch({ type: 'NEW_DOC', docType: 'regulation' }))
    expect(result.current.doc.blocks.map((b) => b.type)).toEqual(['section', 'commencement'])

    for (const docType of ['order', 'temporary_provision'] as const) {
      act(() => result.current.dispatch({ type: 'NEW_DOC', docType }))
      expect(result.current.doc.blocks).toEqual([])
      expect(result.current.doc.docType).toBe(docType)
    }
  })
})

describe('autosave restore-on-load', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('restores a previously autosaved document on mount', () => {
    const saved = {
      id: 'restored-id',
      docType: 'regulation' as const,
      title: 'מסמך שמור',
      year: 'x',
      blocks: [],
      createdAt: 'a',
      updatedAt: 'b',
    }
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(saved))
    const { result } = renderHook(() => useLegislation())
    expect(result.current.doc).toEqual(saved)
  })

  it('falls back to a fresh document when the saved value is corrupted', () => {
    localStorage.setItem(AUTOSAVE_KEY, '{ not valid json')
    const { result } = renderHook(() => useLegislation())
    expect(result.current.doc.title).toBe('')
    expect(result.current.doc.blocks.length).toBeGreaterThan(0)
  })

  it('falls back to a fresh document when the saved value has the wrong shape', () => {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ hello: 'world' }))
    const { result } = renderHook(() => useLegislation())
    expect(result.current.doc.title).toBe('')
  })

  it('writes changes to the fixed autosave key after the debounce window', () => {
    const { result } = renderHook(() => useLegislation())
    act(() => result.current.dispatch({ type: 'SET_META', changes: { title: 'שינוי' } }))
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    const saved = JSON.parse(localStorage.getItem(AUTOSAVE_KEY)!)
    expect(saved.title).toBe('שינוי')
  })
})
