/**
 * NETRA — IndexedDB Offline Field Report Queue
 * Stores geo-tagged reports locally when network is unavailable.
 * Syncs automatically when connectivity returns.
 */

const DB_NAME = "netra_field_reports";
const DB_VERSION = 1;
const STORE_NAME = "pending_reports";

export interface LocalFieldReport {
  localId?: number;           // Auto-assigned by IndexedDB
  incident_type: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  captured_at: string;        // ISO 8601
  mediaBlob?: Blob | null;    // Stored locally; replaced by media_url after upload
  media_url?: string | null;
  source: "citizen" | "patrol";
  status: "FIELD_REPORT";
  sync_status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
  road_impact?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "localId", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveReportLocally(report: Omit<LocalFieldReport, "localId">): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add({ ...report, sync_status: "PENDING" });
    req.onsuccess = () => resolve(req.result as number);
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingReports(): Promise<LocalFieldReport[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () =>
      resolve((req.result as LocalFieldReport[]).filter((r) => r.sync_status === "PENDING"));
    req.onerror = () => reject(req.error);
  });
}

export async function markReportSynced(localId: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(localId);
    getReq.onsuccess = () => {
      const record = getReq.result;
      if (record) {
        record.sync_status = "SYNCED";
        record.mediaBlob = null; // Free memory after sync
        store.put(record);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

export async function markReportFailed(localId: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const getReq = store.get(localId);
    getReq.onsuccess = () => {
      const record = getReq.result;
      if (record) {
        record.sync_status = "FAILED";
        store.put(record);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
