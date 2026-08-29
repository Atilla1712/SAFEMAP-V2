// Safe LocalStorage wrapper for cross-platform and mobile sandbox compatibility

export function safeGetStorage(key: string, defaultValue: string = ""): string {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const val = window.localStorage.getItem(key);
      return val !== null ? val : defaultValue;
    }
  } catch (err) {
    console.warn(`[SafeStorage] Could not read '${key}':`, err);
  }
  return defaultValue;
}

export function safeSetStorage(key: string, value: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn(`[SafeStorage] Could not write '${key}':`, err);
  }
}

export function safeRemoveStorage(key: string): void {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`[SafeStorage] Could not remove '${key}':`, err);
  }
}
