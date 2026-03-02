const memoryFallback = new Map<string, string>();
const hasWindow = typeof window !== 'undefined';

const readRaw = (key: string) => {
  if (!hasWindow) return memoryFallback.get(key) ?? null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryFallback.get(key) ?? null;
  }
};

const writeRaw = (key: string, value: string) => {
  if (!hasWindow) {
    memoryFallback.set(key, value);
    return;
  }
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memoryFallback.set(key, value);
  }
};

const removeRaw = (key: string) => {
  if (!hasWindow) {
    memoryFallback.delete(key);
    return;
  }
  try {
    window.localStorage.removeItem(key);
  } catch {
    memoryFallback.delete(key);
  }
};

export const safeStorage = {
  getItem: readRaw,
  setItem: writeRaw,
  removeItem: removeRaw,
  getJSON<T>(key: string, fallback: T): T {
    const raw = readRaw(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  setJSON<T>(key: string, value: T) {
    writeRaw(key, JSON.stringify(value));
  }
};
