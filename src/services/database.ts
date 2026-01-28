import type { StoredImage, StoredUI } from "../types";

const DB_NAME = "FocusManagerDB";
const DB_VERSION = 1;
const STORE_NAME = "images";
const UI_STORE_NAME = "uiState";

let db: IDBDatabase | null = null;

/**
 * Ensures the database is initialized and returns it.
 * If not initialized, rejects the promise and throws.
 */
function assertDBInitialized(reject: (reason?: unknown) => void): IDBDatabase {
  if (!db) {
    reject(new Error("Database not initialized"));
    throw new Error("Database not initialized"); // This never returns
  }
  return db;
}

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!database.objectStoreNames.contains(UI_STORE_NAME)) {
        database.createObjectStore(UI_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
  });
}

export function saveImageToDB(imageData: StoredImage): Promise<IDBValidKey> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(imageData);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getAllImages(): Promise<StoredImage[]> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request: IDBRequest<StoredImage[]> = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function deleteImageFromDB(id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function deleteAllImages(): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export function getImageById(id: string): Promise<StoredImage | undefined> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function getCurrentImage(): Promise<StoredImage | null> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("timestamp");
    const request = index.openCursor(null, "prev");

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        resolve(cursor.value);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export function updateImageInDB(id: string, updates: Partial<StoredImage>): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const existingImage = getRequest.result;
      if (!existingImage) {
        reject(new Error(`Image with id ${id} not found`));
        return;
      }

      const updatedImage = { ...existingImage, ...updates };
      const putRequest = store.put(updatedImage);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

export function getUIState(): Promise<StoredUI | null> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([UI_STORE_NAME], "readonly");
    const store = transaction.objectStore(UI_STORE_NAME);
    const request = store.get("current");

    request.onsuccess = () => {
      resolve(request.result || null);
    };
    request.onerror = () => reject(request.error);
  });
}

export function saveUIState(uiState: StoredUI): Promise<IDBValidKey> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([UI_STORE_NAME], "readwrite");
    const store = transaction.objectStore(UI_STORE_NAME);
    const request = store.put(uiState);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function updateUIState(updates: Partial<StoredUI>): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([UI_STORE_NAME], "readwrite");
    const store = transaction.objectStore(UI_STORE_NAME);
    const getRequest = store.get("current");

    getRequest.onsuccess = () => {
      const existingUIState = getRequest.result;

      // If UI state doesn't exist, create it with defaults
      const uiStateToSave: StoredUI = existingUIState
        ? { ...existingUIState, ...updates }
        : {
            id: "current",
            aspectRatio: 1,
            showPointMarker: true,
            showGhostImage: true,
            showCodeSnippet: false,
            ...updates,
          };

      const putRequest = store.put(uiStateToSave);

      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

export function clearUIState(): Promise<void> {
  return new Promise((resolve, reject) => {
    const database = assertDBInitialized(reject);

    const transaction = database.transaction([UI_STORE_NAME], "readwrite");
    const store = transaction.objectStore(UI_STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
