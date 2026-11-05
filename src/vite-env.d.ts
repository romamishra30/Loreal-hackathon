/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_URL?: string
  readonly VITE_USE_HASH_ROUTER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

