import { getStorage, removeStorage, setStorage } from "zmp-sdk";

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class ZaloMiniAppStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    try {
      const result = await getStorage({ keys: [key] });
      return result[key] ?? null;
    } catch {
      // Fallback for local browser dev mode
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await setStorage({ data: { [key]: value } });
    } catch {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
      throw new Error(`Storage setItem failed for key: ${key}`);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await removeStorage({ keys: [key] });
    } catch {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    }
  }
}

export const storageAdapter: StorageAdapter = new ZaloMiniAppStorageAdapter();
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "owlexa_student_access_token",
} as const;
