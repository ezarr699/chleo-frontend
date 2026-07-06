/**
 * ============================================================
 * @module      pasien
 * @layer       hook
 * @file        useWilayah.ts
 * @path        src/features/pasien/hooks/useWilayah.ts
 * @description Hooks untuk dropdown wilayah berjenjang (provinsi ->
 *              kabupaten -> kecamatan -> kelurahan). Setiap level di
 *              bawah provinsi hanya aktif (`enabled`) setelah level
 *              induknya dipilih. `useKabupatenNasionalList` beda sendiri —
 *              TIDAK berjenjang, mengambil seluruh kabupaten/kota
 *              se-Indonesia (~514 baris) tanpa filter provinsi, dipakai
 *              Select "Tempat Lahir" yang independen dari alamat saat ini.
 * @since       v1.0.0
 * @ref         https://tanstack.com/query/latest/docs/framework/react/guides/dependent-queries
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query'
import { wilayahService } from '../services/wilayahService'

export function useProvinsiList() {
  return useQuery({
    queryKey: ['wilayah', 'provinsi'],
    queryFn: () => wilayahService.listProvinsi(),
    staleTime: Infinity,
  })
}

export function useKabupatenList(provinsiCode: string) {
  return useQuery({
    queryKey: ['wilayah', 'kabupaten', provinsiCode],
    queryFn: () => wilayahService.listKabupaten(provinsiCode),
    enabled: Boolean(provinsiCode),
    staleTime: Infinity,
  })
}

export function useKabupatenNasionalList() {
  return useQuery({
    queryKey: ['wilayah', 'kabupaten', 'nasional'],
    queryFn: () => wilayahService.listKabupaten(),
    staleTime: Infinity,
  })
}

export function useKecamatanList(kabupatenCode: string) {
  return useQuery({
    queryKey: ['wilayah', 'kecamatan', kabupatenCode],
    queryFn: () => wilayahService.listKecamatan(kabupatenCode),
    enabled: Boolean(kabupatenCode),
    staleTime: Infinity,
  })
}

export function useKelurahanList(kecamatanCode: string) {
  return useQuery({
    queryKey: ['wilayah', 'kelurahan', kecamatanCode],
    queryFn: () => wilayahService.listKelurahan(kecamatanCode),
    enabled: Boolean(kecamatanCode),
    staleTime: Infinity,
  })
}
