import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStore = new Map<string, string>();

export const mockStorage = {
  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    } catch {
      // In case AsyncStorage is unavailable in node or initial environment
      const mem = memoryStore.get(key);
      if (mem) {
        return JSON.parse(mem) as T;
      }
    }
    return defaultValue;
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    const serialized = JSON.stringify(value);
    memoryStore.set(key, serialized);
    try {
      await AsyncStorage.setItem(key, serialized);
    } catch {
      // Fallback already in memoryStore
    }
  },

  async removeItem(key: string): Promise<void> {
    memoryStore.delete(key);
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Fallback
    }
  },

  async clearAll(): Promise<void> {
    memoryStore.clear();
    try {
      await AsyncStorage.clear();
    } catch {
      // Fallback
    }
  },
};

