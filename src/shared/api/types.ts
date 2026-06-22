/**
 * ============================================================
 * @module      shared
 * @layer       shared > type
 * @file        types.ts
 * @path        src/shared/api/types.ts
 * @description Tipe response API standar (lihat CLAUDE.md API Design Standard).
 * @since       v1.0.0
 * ============================================================
 */

export interface ApiSuccessResponse<T> {
  success: true
  message: string
  data: T
  meta?: {
    current_page: number
    per_page: number
    total: number
  }
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors: Record<string, string[]> | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    per_page: number
    total: number
  }
}
