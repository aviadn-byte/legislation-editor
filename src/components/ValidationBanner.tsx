import type { ValidationError } from '../utils/validation'

export interface ValidationBannerProps {
  errors: ValidationError[]
  onJump: (blockId: string) => void
}

export function ValidationBanner({ errors, onJump }: ValidationBannerProps) {
  if (errors.length === 0) return null

  const errorCount = errors.filter((e) => e.severity === 'error').length
  const warningCount = errors.filter((e) => e.severity === 'warning').length

  return (
    <div className="flex flex-col gap-1 border-b border-gray-200 bg-gray-50 p-3 text-sm">
      <div className="font-semibold">
        {errorCount > 0 && <span className="text-red-600">{errorCount} שגיאות</span>}
        {errorCount > 0 && warningCount > 0 && ' · '}
        {warningCount > 0 && <span className="text-yellow-700">{warningCount} אזהרות</span>}
      </div>
      <ul className="flex flex-col gap-0.5">
        {errors.map((e, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onJump(e.blockId)}
              className={e.severity === 'error' ? 'text-red-600 underline' : 'text-yellow-700 underline'}
            >
              {e.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
