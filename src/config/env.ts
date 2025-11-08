interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export const paypalId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
export const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
