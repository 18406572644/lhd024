import type { Attachment, StorageStats, AttachmentType } from '../types';
import { ATTACHMENT_LIMITS } from '../types';
import { encrypt, decrypt, generateId } from './encrypt';

const DB_NAME = 'time_capsule_attachments';
const DB_VERSION = 1;
const STORE_NAME = 'attachments';
const DATA_KEY = 'data';

interface AttachmentRecord {
  id: string;
  capsuleId: string;
  encryptedData: string;
  type: AttachmentType;
  size: number;
}

let dbInstance: IDBDatabase | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('capsuleId', 'capsuleId', { unique: false });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function saveAttachment(
  capsuleId: string,
  file: File,
  type: AttachmentType,
  duration?: number
): Promise<Attachment> {
  const db = await openDB();
  const arrayBuffer = await file.arrayBuffer();
  const base64 = arrayBufferToBase64(arrayBuffer);
  const encryptedData = encrypt(base64);

  const attachmentId = generateId();

  const record: AttachmentRecord = {
    id: attachmentId,
    capsuleId,
    encryptedData,
    type,
    size: file.size,
  };

  const attachment: Attachment = {
    id: attachmentId,
    capsuleId,
    type,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    duration,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(record);

    request.onsuccess = () => resolve(attachment);
    request.onerror = () => reject(request.error);
  });
}

export async function getAttachmentData(attachmentId: string): Promise<Blob | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(attachmentId);

    request.onsuccess = () => {
      const record = request.result as AttachmentRecord | undefined;
      if (!record) {
        resolve(null);
        return;
      }

      try {
        const decryptedBase64 = decrypt(record.encryptedData);
        const arrayBuffer = base64ToArrayBuffer(decryptedBase64);
        const blob = new Blob([arrayBuffer], { type: getMimeType(record.type) });
        resolve(blob);
      } catch (e) {
        reject(e);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getAttachmentDataUrl(attachmentId: string): Promise<string | null> {
  const blob = await getAttachmentData(attachmentId);
  if (!blob) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function deleteAttachment(attachmentId: string): Promise<boolean> {
  const db = await openDB();

  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(attachmentId);

    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
  });
}

export async function deleteAttachmentsByCapsuleId(capsuleId: string): Promise<boolean> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('capsuleId');
    const request = index.openCursor(IDBKeyRange.only(capsuleId));

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      } else {
        resolve(true);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function getStorageStats(): Promise<StorageStats> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();

    let totalSize = 0;
    let imageCount = 0;
    let audioCount = 0;
    let videoCount = 0;

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const record = cursor.value as AttachmentRecord;
        totalSize += record.size;
        if (record.type === 'image') imageCount++;
        else if (record.type === 'audio') audioCount++;
        else if (record.type === 'video') videoCount++;
        cursor.continue();
      } else {
        const stats: StorageStats = {
          totalSize: ATTACHMENT_LIMITS.MAX_TOTAL_STORAGE,
          usedSize: totalSize,
          availableSize: ATTACHMENT_LIMITS.MAX_TOTAL_STORAGE - totalSize,
          attachmentCount: imageCount + audioCount + videoCount,
          imageCount,
          audioCount,
          videoCount,
          usagePercentage: Math.min(100, (totalSize / ATTACHMENT_LIMITS.MAX_TOTAL_STORAGE) * 100),
        };
        resolve(stats);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function clearAllAttachments(): Promise<boolean> {
  const db = await openDB();

  return new Promise((resolve) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => resolve(false);
  });
}

export async function clearOrphanedAttachments(validCapsuleIds: string[]): Promise<number> {
  const db = await openDB();
  let deletedCount = 0;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.openCursor();

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        const record = cursor.value as AttachmentRecord;
        if (!validCapsuleIds.includes(record.capsuleId)) {
          cursor.delete();
          deletedCount++;
        }
        cursor.continue();
      } else {
        resolve(deletedCount);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

function getMimeType(type: AttachmentType): string {
  switch (type) {
    case 'image':
      return 'image/jpeg';
    case 'audio':
      return 'audio/webm';
    case 'video':
      return 'video/webm';
    default:
      return 'application/octet-stream';
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function validateFileSize(file: File, type: AttachmentType): { valid: boolean; message?: string } {
  let maxSize: number;
  switch (type) {
    case 'image':
      maxSize = ATTACHMENT_LIMITS.MAX_IMAGE_SIZE;
      break;
    case 'audio':
      maxSize = ATTACHMENT_LIMITS.MAX_AUDIO_SIZE;
      break;
    case 'video':
      maxSize = ATTACHMENT_LIMITS.MAX_VIDEO_SIZE;
      break;
    default:
      maxSize = 10 * 1024 * 1024;
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      message: `文件大小不能超过 ${formatFileSize(maxSize)}，当前文件 ${formatFileSize(file.size)}`,
    };
  }

  return { valid: true };
}
