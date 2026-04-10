/**
 * IndexedDB-backed queue for offline scans.
 * When the device is offline, scanned books are queued here.
 * When connectivity returns, flush() pushes them to /api/books/create.
 */

import type { CreateBookInput } from "@/types/book";

const DB_NAME = "bookshelf-offline";
const STORE_NAME = "pending-scans";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueue(book: CreateBookInput): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).add({ ...book, queuedAt: Date.now() });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPending(): Promise<
  (CreateBookInput & { id: number })[]
> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const req = tx.objectStore(STORE_NAME).getAll();
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function remove(id: number): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(id);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Flush all pending scans to the server.
 * Call this when the app comes back online.
 */
export async function flush(): Promise<{ synced: number; failed: number }> {
  const pending = await getPending();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const res = await fetch("/api/books/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      // 201 created or 409 duplicate — either way, remove from queue
      if (res.status === 201 || res.status === 409) {
        await remove(item.id);
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return { synced, failed };
}
