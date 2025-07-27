export function apiUrl(path) {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (base && base.trim() !== '') {
    if (path.startsWith('/')) {
      return base + path;
    }
    return `${base}/${path}`;
  }
  return path.startsWith('/') ? path : `/${path}`;
}
