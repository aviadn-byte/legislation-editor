import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)

// Node's own experimental global `localStorage` (present since Node 22+)
// shadows jsdom's implementation in this environment and is a non-functional
// stub without a configured backing file (every method throws/no-ops). Real
// browsers always have a working localStorage — this in-memory polyfill just
// makes the test environment match that, so localStorage-dependent code can
// be tested without depending on this sandbox's Node flags.
class MemoryStorage implements Storage {
  #data = new Map<string, string>()
  get length() {
    return this.#data.size
  }
  clear(): void {
    this.#data.clear()
  }
  getItem(key: string): string | null {
    return this.#data.has(key) ? this.#data.get(key)! : null
  }
  key(index: number): string | null {
    return Array.from(this.#data.keys())[index] ?? null
  }
  removeItem(key: string): void {
    this.#data.delete(key)
  }
  setItem(key: string, value: string): void {
    this.#data.set(key, String(value))
  }
}

const memoryStorage = new MemoryStorage()
Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage, writable: true, configurable: true })
Object.defineProperty(window, 'localStorage', { value: memoryStorage, writable: true, configurable: true })

afterEach(() => {
  memoryStorage.clear()
})
