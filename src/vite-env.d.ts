/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly MODE: string;
  // Ajoutez ici d'autres variables d'environnement si besoin
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
