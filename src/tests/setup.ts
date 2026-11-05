// Robust in-memory storage polyfill for Node 25+ test environment
const memoryStore: Record<string, string> = {}

const mockStorage = {
  getItem: (key: string): string | null => {
    return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null
  },
  setItem: (key: string, value: string): void => {
    memoryStore[key] = String(value)
  },
  removeItem: (key: string): void => {
    delete memoryStore[key]
  },
  clear: (): void => {
    for (const k of Object.keys(memoryStore)) {
      delete memoryStore[k]
    }
  },
  key: (index: number): string | null => {
    const keys = Object.keys(memoryStore)
    return keys[index] ?? null
  },
  get length(): number {
    return Object.keys(memoryStore).length
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true,
})
