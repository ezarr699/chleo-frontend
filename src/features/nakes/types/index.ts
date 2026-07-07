/**
 * ============================================================
 * @module      nakes
 * @layer       type
 * @file        index.ts
 * @path        src/features/nakes/types/index.ts
 * @description Tipe TypeScript untuk modul Profil Nakes.
 * @since       v1.0.0
 * ============================================================
 */

export interface UserRef {
  id: number
  name: string
  email: string
}

export interface MasterDataRef {
  id: number
  name: string
}

export interface ProfilNakes {
  id: number
  user: UserRef
  profesi: MasterDataRef
  poliklinik: MasterDataRef | null
  no_sip: string | null
  no_str: string | null
  str_berlaku_sampai: string | null
  created_at: string
  updated_at: string
}

export interface ProfilNakesPayload {
  user_id: number
  profesi_id: number
  poliklinik_id: number | null
  no_sip: string | null
  no_str: string | null
  str_berlaku_sampai: string | null
}

export interface ProfilNakesListResult {
  items: ProfilNakes[]
  currentPage: number
  perPage: number
  total: number
}
