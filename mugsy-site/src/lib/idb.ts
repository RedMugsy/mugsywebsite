export type IDBResult<T> = Promise<T>

const DB_NAME = 'rm-i18n-cache'
const STORE = 'translations'
const VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function idbGet<T=any>(key: string): IDBResult<T | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const st = tx.objectStore(STORE)
    const req = st.get(key)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror = () => reject(req.error)
  })
}

export async function idbSet<T=any>(key: string, val: T): IDBResult<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    const st = tx.objectStore(STORE)
    const req = st.put(val as any, key)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

