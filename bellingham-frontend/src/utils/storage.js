export function safeSetItem(key, value) {
  try {
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
