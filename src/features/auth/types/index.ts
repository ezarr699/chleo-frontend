/**
 * ============================================================
 * @module      auth
 * @layer       type
 * @file        index.ts
 * @path        src/features/auth/types/index.ts
 * @description Tipe TypeScript untuk modul Auth.
 * @since       v1.0.0
 * ============================================================
 */

export interface User {
  id: number
  name: string
  email: string
  permissions: string[]
}

export interface LoginPayload {
  email: string
  password: string
}
