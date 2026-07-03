import type { ChangeEvent } from 'react'
import { isLegislationDoc, type DocType, type LegislationDoc } from '../types/legislation'

const DOC_TYPE_LABELS: Record<DocType, string> = {
  new_law: 'חוק חדש',
  amending_law: 'חוק מתקן',
  regulation: 'תקנות',
  order: 'צו',
  temporary_provision: 'הוראת שעה',
}

export interface DocHeaderProps {
  doc: LegislationDoc
  exportDisabled: boolean
  onMetaChange: (changes: Partial<Pick<LegislationDoc, 'title' | 'docType' | 'year'>>) => void
  onNewDoc: (docType: DocType) => void
  onExport: () => void
  onLoadDoc: (doc: LegislationDoc) => void
}

export function DocHeader({ doc, exportDisabled, onMetaChange, onNewDoc, onExport, onLoadDoc }: DocHeaderProps) {
  function handleSave() {
    const json = JSON.stringify(doc, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${doc.title || 'מסמך'}.legislation.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleLoad(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!isLegislationDoc(parsed)) {
        alert('הקובץ שנבחר אינו קובץ מסמך חקיקה תקין (.legislation.json)')
        return
      }
      onLoadDoc(parsed)
    } catch {
      alert('לא ניתן לקרוא את הקובץ — ודא שזהו קובץ .legislation.json תקין')
    }
  }

  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={doc.title}
          onChange={(e) => onMetaChange({ title: e.target.value })}
          placeholder='כותרת החוק (למשל: חוק הגנת הילד, התשפ"ה-2025)'
          className="min-w-64 flex-1 rounded border border-gray-300 px-2 py-1 font-semibold"
        />
        <input
          type="text"
          value={doc.year}
          onChange={(e) => onMetaChange({ year: e.target.value })}
          placeholder='שנה (למשל: התשפ"ה)'
          className="w-32 rounded border border-gray-300 px-2 py-1"
        />
        <select
          value={doc.docType}
          onChange={(e) => onMetaChange({ docType: e.target.value as DocType })}
          className="rounded border border-gray-300 px-2 py-1"
        >
          {(Object.keys(DOC_TYPE_LABELS) as DocType[]).map((dt) => (
            <option key={dt} value={dt}>
              {DOC_TYPE_LABELS[dt]}
            </option>
          ))}
        </select>
      </div>

      {doc.docType === 'amending_law' && (
        <p className="rounded bg-yellow-50 px-3 py-1.5 text-sm text-yellow-800">
          ⚠ תמיכה חלקית בשלב זה: "חוק מתקן" מתנהג כרגע כמו "חוק חדש" — אין עדיין תמיכה בהפניה לחוק המתוקן או במספור תיקון פנימי (למשל "1א").
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-500">מסמך חדש:</span>
        {(Object.keys(DOC_TYPE_LABELS) as DocType[]).map((dt) => (
          <button key={dt} type="button" onClick={() => onNewDoc(dt)} className="text-sm underline">
            {DOC_TYPE_LABELS[dt]}
          </button>
        ))}

        <span className="mx-2 text-gray-300">|</span>

        <button type="button" onClick={handleSave} className="text-sm underline">
          שמור
        </button>
        <label className="cursor-pointer text-sm underline">
          טען
          <input type="file" accept=".json" onChange={handleLoad} className="hidden" />
        </label>

        <button
          type="button"
          onClick={onExport}
          disabled={exportDisabled}
          className="mr-auto rounded bg-blue-600 px-4 py-1.5 font-semibold text-white disabled:opacity-30"
        >
          ייצוא לוורד
        </button>
      </div>
    </div>
  )
}
