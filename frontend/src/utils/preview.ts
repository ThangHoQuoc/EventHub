export function getDevPreviewParam(name: string) {
  if (!import.meta.env.DEV || typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get(name);
}

