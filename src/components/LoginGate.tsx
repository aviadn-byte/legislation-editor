import { useState, type ReactNode, type FormEvent } from 'react'

// This is a client-side gate only — the credentials ship inside the public
// JS bundle of a static site, so it deters casual visitors but is not real
// access control. Anyone who reads the source can find the credentials.
const USERNAME = 'smopi'
const PASSWORD = 'Imon_2026'
const SESSION_KEY = 'legislation-editor-authenticated'

export function LoginGate({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  if (authenticated) return <>{children}</>

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (username === USERNAME && password === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setAuthenticated(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-3 rounded border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-center text-lg font-semibold">עורך חקיקה</h1>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="שם משתמש"
          className="rounded border border-gray-300 px-2 py-1.5"
          autoFocus
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="סיסמה"
          className="rounded border border-gray-300 px-2 py-1.5"
        />
        {error && <p className="text-sm text-red-600">שם משתמש או סיסמה שגויים</p>}
        <button type="submit" className="rounded bg-blue-600 px-4 py-1.5 font-semibold text-white">
          כניסה
        </button>
      </form>
    </div>
  )
}
