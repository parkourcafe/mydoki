"use client";

// Локальное офлайн-хранилище документов (IndexedDB).
// Два хранилища: `meta` — описание документа (без файлов, лёгкое для списка),
// `files` — бинарные копии файлов (Blob), привязанные к документу.
// Всё лежит ТОЛЬКО на устройстве пользователя — на сервер ничего не уходит.

export type OfflineFileMeta = {
  id: string;
  name: string;
  mime: string;
  size: number;
};

export type OfflineMeta = {
  id: string;
  title: string;
  category: string;
  subtype: string | null;
  issuer: string | null;
  docNumber: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  notes: string | null;
  ownerName: string | null;
  savedAt: number;
  files: OfflineFileMeta[];
};

export type OfflineFileInput = OfflineFileMeta & { blob: Blob };

const DB_NAME = "doki-offline";
const VERSION = 1;
const STORE_META = "meta";
const STORE_FILES = "files";

function hasIdb(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        const files = db.createObjectStore(STORE_FILES, { keyPath: "id" });
        files.createIndex("docId", "docId", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/** Сохранить документ и его файлы для офлайн-доступа. */
export async function saveDoc(
  meta: Omit<OfflineMeta, "savedAt" | "files"> & { files: OfflineFileMeta[] },
  files: OfflineFileInput[]
): Promise<void> {
  if (!hasIdb()) throw new Error("no-idb");
  const db = await openDb();
  try {
    const tx = db.transaction([STORE_META, STORE_FILES], "readwrite");
    const metaStore = tx.objectStore(STORE_META);
    const fileStore = tx.objectStore(STORE_FILES);

    // Чистим прежние файлы этого документа (на случай повторного сохранения).
    const idx = fileStore.index("docId");
    const range = IDBKeyRange.only(meta.id);
    await new Promise<void>((resolve) => {
      const cur = idx.openCursor(range);
      cur.onsuccess = () => {
        const c = cur.result;
        if (c) {
          c.delete();
          c.continue();
        } else resolve();
      };
      cur.onerror = () => resolve();
    });

    metaStore.put({ ...meta, savedAt: Date.now() } satisfies OfflineMeta);
    for (const f of files) {
      fileStore.put({
        id: f.id,
        docId: meta.id,
        name: f.name,
        mime: f.mime,
        size: f.size,
        blob: f.blob,
      });
    }
    await done(tx);
  } finally {
    db.close();
  }
}

/** Список сохранённых документов (только метаданные), новые сверху. */
export async function listDocs(): Promise<OfflineMeta[]> {
  if (!hasIdb()) return [];
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_META, "readonly");
    const req = tx.objectStore(STORE_META).getAll();
    const all = await new Promise<OfflineMeta[]>((resolve, reject) => {
      req.onsuccess = () => resolve((req.result as OfflineMeta[]) ?? []);
      req.onerror = () => reject(req.error);
    });
    return all.sort((a, b) => b.savedAt - a.savedAt);
  } finally {
    db.close();
  }
}

/** Метаданные одного документа. */
export async function getDoc(id: string): Promise<OfflineMeta | undefined> {
  if (!hasIdb()) return undefined;
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_META, "readonly");
    const req = tx.objectStore(STORE_META).get(id);
    return await new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result as OfflineMeta | undefined);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

/** Есть ли документ в офлайн-хранилище. */
export async function isSaved(id: string): Promise<boolean> {
  return (await getDoc(id)) !== undefined;
}

/** Blob файла по id (для показа/скачивания офлайн). */
export async function getFileBlob(fileId: string): Promise<Blob | undefined> {
  if (!hasIdb()) return undefined;
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_FILES, "readonly");
    const req = tx.objectStore(STORE_FILES).get(fileId);
    const rec = await new Promise<{ blob: Blob } | undefined>(
      (resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }
    );
    return rec?.blob;
  } finally {
    db.close();
  }
}

/** Удалить документ и его файлы из офлайн-хранилища. */
export async function removeDoc(id: string): Promise<void> {
  if (!hasIdb()) return;
  const db = await openDb();
  try {
    const tx = db.transaction([STORE_META, STORE_FILES], "readwrite");
    tx.objectStore(STORE_META).delete(id);
    const idx = tx.objectStore(STORE_FILES).index("docId");
    await new Promise<void>((resolve) => {
      const cur = idx.openCursor(IDBKeyRange.only(id));
      cur.onsuccess = () => {
        const c = cur.result;
        if (c) {
          c.delete();
          c.continue();
        } else resolve();
      };
      cur.onerror = () => resolve();
    });
    await done(tx);
  } finally {
    db.close();
  }
}

/** Полностью очистить офлайн-хранилище. */
export async function clearAll(): Promise<void> {
  if (!hasIdb()) return;
  const db = await openDb();
  try {
    const tx = db.transaction([STORE_META, STORE_FILES], "readwrite");
    tx.objectStore(STORE_META).clear();
    tx.objectStore(STORE_FILES).clear();
    await done(tx);
  } finally {
    db.close();
  }
}

/** Примерный объём, занятый офлайн-данными приложения (байты). */
export async function estimateUsage(): Promise<number | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate)
    return null;
  try {
    const e = await navigator.storage.estimate();
    return e.usage ?? null;
  } catch {
    return null;
  }
}
