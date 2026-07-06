/**
 * ============================================================
 * @module      pasien
 * @layer       service
 * @file        pasienService.ts
 * @path        src/features/pasien/services/pasienService.ts
 * @description Semua pemanggilan API endpoint /pasien. `verify` dikirim
 *              sebagai FormData (multipart) karena menyertakan file foto.
 * @since       v1.0.0
 * ============================================================
 */

import { apiClient } from '@/shared/api/client'
import type { ApiSuccessResponse } from '@/shared/api/types'
import type {
  CreatePasienPayload,
  Pasien,
  PasienListResult,
  UpdatePasienPayload,
  VerifyPasienPayload,
} from '../types'

function toVerifyFormData(payload: VerifyPasienPayload): FormData {
  const formData = new FormData()
  const { asuransi, ...scalarFields } = payload

  for (const [key, value] of Object.entries(scalarFields)) {
    if (value === undefined || value === '') continue
    formData.append(key, value as string | Blob)
  }

  // Format array Laravel standar untuk multipart form data: asuransi[0][asuransi_id], dst.
  asuransi.forEach((entry, index) => {
    formData.append(`asuransi[${index}][asuransi_id]`, String(entry.asuransi_id))
    if (entry.nomor_polis) formData.append(`asuransi[${index}][nomor_polis]`, entry.nomor_polis)
    if (entry.masa_berlaku) formData.append(`asuransi[${index}][masa_berlaku]`, entry.masa_berlaku)
  })

  return formData
}

export const pasienService = {
  list: (page = 1, perPage = 15): Promise<PasienListResult> =>
    apiClient
      .get<ApiSuccessResponse<Pasien[]>>('/pasien', { params: { page, per_page: perPage } })
      .then((r) => ({
        items: r.data.data,
        currentPage: r.data.meta?.current_page ?? page,
        perPage: r.data.meta?.per_page ?? perPage,
        total: r.data.meta?.total ?? r.data.data.length,
      })),

  create: (payload: CreatePasienPayload): Promise<Pasien> =>
    apiClient.post<ApiSuccessResponse<Pasien>>('/pasien', payload).then((r) => r.data.data),

  update: (id: number, payload: UpdatePasienPayload): Promise<Pasien> =>
    apiClient.put<ApiSuccessResponse<Pasien>>(`/pasien/${id}`, payload).then((r) => r.data.data),

  remove: (id: number): Promise<void> => apiClient.delete(`/pasien/${id}`).then(() => undefined),

  verify: (id: number, payload: VerifyPasienPayload): Promise<Pasien> =>
    apiClient
      .post<ApiSuccessResponse<Pasien>>(`/pasien/${id}/verifikasi`, toVerifyFormData(payload), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data),

  setStatus: (id: number, aktif: boolean): Promise<Pasien> =>
    apiClient
      .patch<ApiSuccessResponse<Pasien>>(`/pasien/${id}/status`, { aktif })
      .then((r) => r.data.data),
}
