/**
 * ============================================================
 * @module      pasien
 * @layer       type
 * @file        index.ts
 * @path        src/features/pasien/types/index.ts
 * @description Tipe TypeScript untuk modul Pasien. Status workflow:
 *              belum_verifikasi (default saat add) -> aktif (otomatis
 *              setelah verifikasi) -> nonaktif (toggle manual, bisa
 *              dibalik lagi tanpa verifikasi ulang).
 * @since       v1.0.0
 * ============================================================
 */

export type PasienStatus = 'belum_verifikasi' | 'aktif' | 'nonaktif'

export interface MasterDataRef {
  id: number
  name: string
}

export interface PasienAsuransi {
  id: number
  asuransi: MasterDataRef
  nomor_polis: string | null
  masa_berlaku: string | null
}

export interface WilayahRef {
  code: string
  name: string
}

export interface Pasien {
  id: number
  nik: string
  nama: string
  tanggal_lahir: string
  jenis_kelamin: MasterDataRef | null
  status: PasienStatus
  foto_url: string | null
  tempat_lahir: string | null
  golongan_darah: MasterDataRef | null
  nomor_telepon: string | null
  alamat: string | null
  provinsi: WilayahRef | null
  kabupaten: WilayahRef | null
  kecamatan: WilayahRef | null
  kelurahan: WilayahRef | null
  bpjs_nomor: string | null
  bpjs_jenis_peserta: string | null
  bpjs_kelas: string | null
  bpjs_nama_fasyankes: string | null
  bpjs_kode_fasyankes: string | null
  bpjs_masa_berlaku: string | null
  asuransi_list: PasienAsuransi[]
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface PasienListResult {
  items: Pasien[]
  currentPage: number
  perPage: number
  total: number
}

export interface CreatePasienPayload {
  nik: string
  nama: string
  tanggal_lahir: string
  jenis_kelamin_id: number
}

export type UpdatePasienPayload = CreatePasienPayload

export interface VerifyPasienPayload {
  foto: File
  tempat_lahir: string
  golongan_darah_id: number
  nomor_telepon: string
  alamat: string
  provinsi_code?: string
  kabupaten_code?: string
  kecamatan_code?: string
  kelurahan_code?: string
  bpjs_nomor?: string
  bpjs_jenis_peserta?: string
  bpjs_kelas?: string
  bpjs_nama_fasyankes?: string
  bpjs_kode_fasyankes?: string
  bpjs_masa_berlaku?: string
  asuransi: VerifyPasienAsuransiEntry[]
}

export interface VerifyPasienAsuransiEntry {
  asuransi_id: number
  nomor_polis?: string
  masa_berlaku?: string
}
