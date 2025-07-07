export function safeSetItem(key, value, { maxLength = 5_000_000 } = {}) {
  try {
    if (typeof value === 'string' && value.length > maxLength) {
      console.warn(`Value for ${key} exceeds ${maxLength} characters; skipping`);
      return false;
    }
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.error('Failed to store', key, e);
    return false;
  }
}

export function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error('Failed to read', key, e);
    return null;
  }
}
