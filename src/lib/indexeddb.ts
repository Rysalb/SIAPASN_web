/**
 * IndexedDB Client-Side High Performance Cache
 * Adheres strictly to PRD2 Section 4 (IndexedDB Local Caching) & Section 5 (Examination Optimization).
 * 
 * Capabilities:
 * - Zero-query question navigation (offline-capable)
 * - Immediate local answer recording
 * - Offline sync queue with automatic recovery
 * - Material caching
 */

const DB_NAME = 'SIAPASN_CLIENT_CACHE';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is only available in the browser'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Exam session cache (questions snapshot without answers)
      if (!db.objectStoreNames.contains('exam_sessions')) {
        db.createObjectStore('exam_sessions', { keyPath: 'attemptId' });
      }

      // 2. Draft answers store
      if (!db.objectStoreNames.contains('draft_answers')) {
        const answerStore = db.createObjectStore('draft_answers', { keyPath: 'id' });
        answerStore.createIndex('attemptId', 'attemptId', { unique: false });
        answerStore.createIndex('isSynced', 'isSynced', { unique: false });
      }

      // 3. Materials cache
      if (!db.objectStoreNames.contains('materials_cache')) {
        db.createObjectStore('materials_cache', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

// --- EXAM CACHING ---

export async function cacheExamSession(attemptId: string, examData: any): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('exam_sessions', 'readwrite');
    tx.objectStore('exam_sessions').put({
      attemptId,
      packageId: examData.package?.id,
      packageTitle: examData.package?.title,
      durationMinutes: examData.package?.durationMinutes,
      questions: examData.questions, // Note: no correct answers stored
      expiresAt: examData.attempt?.expiresAt,
      cachedAt: Date.now(),
    });
  } catch (e) {
    console.warn('[IndexedDB] Failed to cache exam session:', e);
  }
}

export async function getCachedExamSession(attemptId: string): Promise<any | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('exam_sessions', 'readonly');
      const req = tx.objectStore('exam_sessions').get(attemptId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

// --- DRAFT ANSWERS & OFFLINE QUEUE ---

export async function saveLocalDraftAnswer(
  attemptId: string,
  questionId: string,
  selectedOptionId: string | null,
  isMarked: boolean
): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('draft_answers', 'readwrite');
    tx.objectStore('draft_answers').put({
      id: `${attemptId}_${questionId}`,
      attemptId,
      questionId,
      selectedOptionId,
      isMarked,
      isSynced: false,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.warn('[IndexedDB] Failed to save local draft answer:', e);
  }
}

export async function getUnsyncedAnswers(attemptId: string): Promise<any[]> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('draft_answers', 'readonly');
      const index = tx.objectStore('draft_answers').index('attemptId');
      const req = index.getAll(attemptId);
      req.onsuccess = () => {
        const all: any[] = req.result || [];
        resolve(all.filter((a) => !a.isSynced));
      };
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

export async function markAnswersAsSynced(attemptId: string, questionIds: string[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('draft_answers', 'readwrite');
    const store = tx.objectStore('draft_answers');
    for (const qId of questionIds) {
      const id = `${attemptId}_${qId}`;
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (getReq.result) {
          getReq.result.isSynced = true;
          store.put(getReq.result);
        }
      };
    }
  } catch (e) {
    console.warn('[IndexedDB] Failed to mark answers as synced:', e);
  }
}

export async function clearExamSessionCache(attemptId: string): Promise<void> {
  try {
    const db = await getDB();
    const tx1 = db.transaction('exam_sessions', 'readwrite');
    tx1.objectStore('exam_sessions').delete(attemptId);

    const tx2 = db.transaction('draft_answers', 'readwrite');
    const store = tx2.objectStore('draft_answers');
    const index = store.index('attemptId');
    const req = index.getAllKeys(attemptId);
    req.onsuccess = () => {
      const keys = req.result;
      keys.forEach((k) => store.delete(k));
    };
  } catch (e) {
    console.warn('[IndexedDB] Failed to clear exam session cache:', e);
  }
}

// --- MATERIALS CACHING ---

export async function cacheMaterial(id: string, data: any): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('materials_cache', 'readwrite');
    tx.objectStore('materials_cache').put({
      id,
      data,
      cachedAt: Date.now(),
    });
  } catch (e) {
    console.warn('[IndexedDB] Failed to cache material:', e);
  }
}

export async function getCachedMaterial(id: string): Promise<any | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction('materials_cache', 'readonly');
      const req = tx.objectStore('materials_cache').get(id);
      req.onsuccess = () => {
        const res = req.result;
        if (!res) return resolve(null);
        // Expire cache after 24 hours
        if (Date.now() - res.cachedAt > 24 * 60 * 60 * 1000) {
          return resolve(null);
        }
        resolve(res.data);
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

