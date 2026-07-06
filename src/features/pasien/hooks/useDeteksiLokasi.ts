/**
 * ============================================================
 * @module      pasien
 * @layer       hook
 * @file        useDeteksiLokasi.ts
 * @path        src/features/pasien/hooks/useDeteksiLokasi.ts
 * @description Hook untuk tombol "Gunakan Lokasi Saat Ini": minta izin
 *              lokasi browser (Geolocation API), lalu kirim koordinatnya
 *              ke backend untuk dicocokkan ke provinsi/kabupaten/
 *              kecamatan/kelurahan. Dibungkus sebagai mutation (bukan
 *              query) karena dipicu manual oleh klik tombol, bukan
 *              otomatis saat mount.
 * @since       v1.0.0
 * @ref         https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
 * ============================================================
 */

import { useMutation } from '@tanstack/react-query'
import { wilayahService } from '../services/wilayahService'
import type { DeteksiLokasiResult } from '../services/wilayahService'

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Browser ini tidak mendukung deteksi lokasi.'))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    })
  })
}

function toErrorMessage(error: unknown): string {
  if (error instanceof GeolocationPositionError) {
    if (error.code === error.PERMISSION_DENIED) return 'Izin lokasi ditolak. Aktifkan izin lokasi lalu coba lagi.'
    if (error.code === error.TIMEOUT) return 'Deteksi lokasi memakan waktu terlalu lama, coba lagi.'
    return 'Lokasi tidak tersedia saat ini.'
  }

  if (error instanceof Error) return error.message

  return 'Gagal mendeteksi lokasi.'
}

export function useDeteksiLokasi() {
  return useMutation<DeteksiLokasiResult, Error>({
    mutationFn: async () => {
      try {
        const position = await getCurrentPosition()
        return await wilayahService.deteksiLokasi(position.coords.latitude, position.coords.longitude)
      } catch (error) {
        throw new Error(toErrorMessage(error), { cause: error })
      }
    },
  })
}
