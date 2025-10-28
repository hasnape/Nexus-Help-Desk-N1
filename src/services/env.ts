export const BASE_URL =
  import.meta.env.VITE_BASE_URL
  ?? (import.meta as any).env.NEXT_PUBLIC_BASE_URL
  ?? 'https://www.nexussupporthub.eu';
