/**
 * ============================================================
 * @module      pasien
 * @layer       service
 * @file        wilayahService.ts
 * @path        src/features/pasien/services/wilayahService.ts
 * @description Lookup data wilayah administratif Indonesia (provinsi,
 *              kabupaten/kota, kecamatan, kelurahan/desa) untuk mengisi
 *              dropdown berjenjang alamat pasien, plus deteksi lokasi dari
 *              koordinat browser (reverse-geocode di backend).
 *              `listKabupaten` sengaja punya `provinsiCode` opsional —
 *              dipanggil tanpa argumen untuk daftar kabupaten/kota
 *              nasional (dipakai Select "Tempat Lahir" di dialog
 *              verifikasi pasien, lihat `useKabupatenNasionalList` di
 *              `../hooks/useWilayah.ts`), dan dengan argumen untuk
 *              dropdown alamat berjenjang yang terikat provinsi.
 * @since       v1.0.0
 * ============================================================
 */

import { apiClient } from '@/shared/api/client'
import type { ApiSuccessResponse } from '@/shared/api/types'
import type { WilayahRef } from '../types'

export interface DeteksiLokasiResult {
  provinsi: WilayahRef | null
  kabupaten: WilayahRef | null
  kecamatan: WilayahRef | null
  kelurahan: WilayahRef | null
}

export const wilayahService = {
  listProvinsi: (): Promise<WilayahRef[]> =>
    apiClient.get<ApiSuccessResponse<WilayahRef[]>>('/wilayah/provinsi').then((r) => r.data.data),

  listKabupaten: (provinsiCode?: string): Promise<WilayahRef[]> =>
    apiClient
      .get<ApiSuccessResponse<WilayahRef[]>>('/wilayah/kabupaten', {
        params: provinsiCode ? { provinsi: provinsiCode } : {},
      })
      .then((r) => r.data.data),

  listKecamatan: (kabupatenCode: string): Promise<WilayahRef[]> =>
    apiClient
      .get<ApiSuccessResponse<WilayahRef[]>>('/wilayah/kecamatan', { params: { kabupaten: kabupatenCode } })
      .then((r) => r.data.data),

  listKelurahan: (kecamatanCode: string): Promise<WilayahRef[]> =>
    apiClient
      .get<ApiSuccessResponse<WilayahRef[]>>('/wilayah/kelurahan', { params: { kecamatan: kecamatanCode } })
      .then((r) => r.data.data),

  deteksiLokasi: (lat: number, lng: number): Promise<DeteksiLokasiResult> =>
    apiClient
      .get<ApiSuccessResponse<DeteksiLokasiResult>>('/wilayah/deteksi-lokasi', { params: { lat, lng } })
      .then((r) => r.data.data),
}
