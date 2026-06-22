import localforage from 'localforage';

// Configure localforage to use IndexedDB
localforage.config({
  name: 'HazinaScoutApp',
  storeName: 'scout_offline_data',
});

const PHOTOS_KEY = 'hz_scout_photos';

/**
 * Save an array of File objects (photos) to IndexedDB
 */
export async function savePhotosToIndexedDB(files: File[]): Promise<void> {
  try {
    await localforage.setItem(PHOTOS_KEY, files);
  } catch (error) {
    console.error('Error saving photos to IndexedDB:', error);
  }
}

/**
 * Retrieve the array of File objects from IndexedDB
 */
export async function getPhotosFromIndexedDB(): Promise<File[]> {
  try {
    const files = await localforage.getItem<File[]>(PHOTOS_KEY);
    return files || [];
  } catch (error) {
    console.error('Error retrieving photos from IndexedDB:', error);
    return [];
  }
}

/**
 * Clear the photos from IndexedDB
 */
export async function clearPhotosFromIndexedDB(): Promise<void> {
  try {
    await localforage.removeItem(PHOTOS_KEY);
  } catch (error) {
    console.error('Error clearing photos from IndexedDB:', error);
  }
}

// ------------------------------------------------------------------
// OUTBOX QUEUE (For Offline Submissions)
// ------------------------------------------------------------------

export interface OutboxItem {
  id: string;
  createdAt: number;
  pathPoints: [number, number][];
  distance: number;
  visionTags: any[];
  formAnswers: any;
  photos: File[];
  status: 'pending' | 'failed';
}

const OUTBOX_KEY = 'hz_scout_outbox';

export async function saveToOutbox(item: OutboxItem): Promise<void> {
  try {
    const existing = await localforage.getItem<OutboxItem[]>(OUTBOX_KEY) || [];
    await localforage.setItem(OUTBOX_KEY, [...existing, item]);
  } catch (error) {
    console.error('Error saving to outbox:', error);
  }
}

export async function getOutboxItems(): Promise<OutboxItem[]> {
  try {
    return (await localforage.getItem<OutboxItem[]>(OUTBOX_KEY)) || [];
  } catch (error) {
    console.error('Error retrieving outbox items:', error);
    return [];
  }
}

export async function removeFromOutbox(id: string): Promise<void> {
  try {
    const existing = await localforage.getItem<OutboxItem[]>(OUTBOX_KEY) || [];
    await localforage.setItem(OUTBOX_KEY, existing.filter(i => i.id !== id));
  } catch (error) {
    console.error('Error removing from outbox:', error);
  }
}

