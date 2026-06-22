/**
 * ============================================================
 * @module      master-data
 * @layer       type
 * @file        index.ts
 * @path        src/features/master-data/types/index.ts
 * @description Tipe TypeScript generik untuk semua data master
 *              (Agama, Golongan Darah, Status Pernikahan, Pendidikan,
 *              Pekerjaan) — bentuknya identik di backend (id, name,
 *              created_at, updated_at), jadi satu tipe dipakai bersama.
 * @since       v1.0.0
 * ============================================================
 */

export interface MasterDataItem {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface MasterDataPayload {
  name: string
}

export interface MasterDataListResult {
  items: MasterDataItem[]
  currentPage: number
  perPage: number
  total: number
}
