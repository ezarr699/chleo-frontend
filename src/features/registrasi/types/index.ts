/**
 * ============================================================
 * @module      registrasi
 * @layer       type
 * @file        index.ts
 * @path        src/features/registrasi/types/index.ts
 * @description Tipe TypeScript untuk modul Registrasi (Kunjungan):
 *              walk-in (REG-01-1), rujukan masuk/keluar (REG-01-2),
 *              online booking (REG-01-3), dan transisi status antrian.
 * @since       v1.0.0
 * ============================================================
 */

export type KunjunganStatus = 'terjadwal' | 'menunggu' | 'dipanggil' | 'selesai' | 'batal' | 'dirujuk'

export interface PasienRef {
  id: number
  nik: string
  nama: string
}

export interface PoliklinikRef {
  id: number
  name: string
  kode_bpjs: string | null
}

export interface ProfilNakesRef {
  id: number
  nama: string | null
  kode_bpjs: string | null
}

export interface PenjaminRef {
  id: number
  name: string
  is_bpjs: boolean
}

export interface RujukanEntry {
  id: number
  arah: 'masuk' | 'keluar'
  asal_faskes_kode: string | null
  asal_faskes_nama: string | null
  tujuan_faskes_kode: string | null
  tujuan_faskes_nama: string | null
  nomor_rujukan_sisrute: string | null
  nomor_rujukan_bpjs: string | null
  diagnosa_rujukan: string | null
  catatan_rujukan: string | null
  tanggal_rujukan: string | null
}

export interface Kunjungan {
  id: number
  pasien: PasienRef | null
  poliklinik: PoliklinikRef | null
  profil_nakes: ProfilNakesRef | null
  penjamin: PenjaminRef | null
  cara_masuk: string
  sumber_booking: string | null
  tanggal_kunjungan: string | null
  jam_praktek: string | null
  no_registrasi: string | null
  urutan_harian: number | null
  no_antrian: string | null
  angka_antrian: number | null
  status: KunjunganStatus
  alasan_batal: string | null
  catatan: string | null
  registered_by: string | null
  rujukan?: RujukanEntry[]
  created_at: string
  updated_at: string
}

export interface KunjunganListResult {
  items: Kunjungan[]
  currentPage: number
  perPage: number
  total: number
}

export interface CreateWalkInPayload {
  pasien_id: number
  poliklinik_id: number
  profil_nakes_id: number | null
  penjamin_id: number
  tanggal_kunjungan?: string
  jam_praktek?: string
  catatan?: string
}

export interface CreateRujukanMasukPayload extends CreateWalkInPayload {
  asal_faskes_kode: string
  asal_faskes_nama: string
  nomor_rujukan_sisrute?: string
  nomor_rujukan_bpjs?: string
  diagnosa_rujukan?: string
  catatan_rujukan?: string
  tanggal_rujukan?: string
}

export interface CreateBookingPayload {
  pasien_id: number
  poliklinik_id: number
  profil_nakes_id: number | null
  penjamin_id: number
  tanggal_kunjungan: string
  jam_praktek?: string
  sumber_booking: 'web_portal' | 'mobile_jkn'
  catatan?: string
}

export interface RujukanKeluarPayload {
  tujuan_faskes_kode: string
  tujuan_faskes_nama: string
  nomor_rujukan_sisrute?: string
  nomor_rujukan_bpjs?: string
  diagnosa_rujukan?: string
  catatan_rujukan?: string
  tanggal_rujukan?: string
}
