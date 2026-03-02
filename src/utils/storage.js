const memoryFallback = new Map();
const hasWindow = typeof window !== 'undefined';
const readRaw = (key) => {
    if (!hasWindow)
        return memoryFallback.get(key) ?? null;
    try {
        return window.localStorage.getItem(key);
    }
    catch {
        return memoryFallback.get(key) ?? null;
    }
};
const writeRaw = (key, value) => {
    if (!hasWindow) {
        memoryFallback.set(key, value);
        return;
    }
    try {
        window.localStorage.setItem(key, value);
    }
    catch {
        memoryFallback.set(key, value);
    }
};
const removeRaw = (key) => {
    if (!hasWindow) {
        memoryFallback.delete(key);
        return;
    }
    try {
        window.localStorage.removeItem(key);
    }
    catch {
        memoryFallback.delete(key);
    }
};
export const safeStorage = {
    getItem: readRaw,
    setItem: writeRaw,
    removeItem: removeRaw,
    getJSON(key, fallback) {
        const raw = readRaw(key);
        if (!raw)
            return fallback;
        try {
            return JSON.parse(raw);
        }
        catch {
            return fallback;
        }
    },
    setJSON(key, value) {
        writeRaw(key, JSON.stringify(value));
    }
};
