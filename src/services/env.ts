export const BASE_URL =
  import.meta.env.VITE_BASE_URL
  ?? (import.meta as any).env.NEXT_PUBLIC_BASE_URL
  ?? 'https://www.nexussupporthub.eu';
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_BASE_URL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_PAYPAL_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
