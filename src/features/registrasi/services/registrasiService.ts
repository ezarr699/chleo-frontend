/**
 * ============================================================
 * @module      registrasi
 * @layer       service
 * @file        registrasiService.ts
 * @path        src/features/registrasi/services/registrasiService.ts
 * @description Semua pemanggilan API endpoint /kunjungan: walk-in,
 *              rujukan masuk/keluar, online booking, dan transisi
 *              status antrian (checkin/panggil/selesai/batal).
 * @since       v1.0.0
 * ============================================================
 */

import { apiClient } from '@/shared/api/client'
import type { ApiSuccessResponse } from '@/shared/api/types'
import type {
  CreateBookingPayload,
  CreateRujukanMasukPayload,
  CreateWalkInPayload,
  Kunjungan,
  KunjunganListResult,
  RujukanKeluarPayload,
} from '../types'

export const registrasiService = {
  list: (page = 1, perPage = 15): Promise<KunjunganListResult> =>
    apiClient
      .get<ApiSuccessResponse<Kunjungan[]>>('/kunjungan', { params: { page, per_page: perPage } })
      .then((r) => ({
        items: r.data.data,
        currentPage: r.data.meta?.current_page ?? page,
        perPage: r.data.meta?.per_page ?? perPage,
        total: r.data.meta?.total ?? r.data.data.length,
      })),

  createWalkIn: (payload: CreateWalkInPayload): Promise<Kunjungan> =>
    apiClient.post<ApiSuccessResponse<Kunjungan>>('/kunjungan', payload).then((r) => r.data.data),

  createRujukanMasuk: (payload: CreateRujukanMasukPayload): Promise<Kunjungan> =>
    apiClient
      .post<ApiSuccessResponse<Kunjungan>>('/kunjungan/rujukan-masuk', payload)
      .then((r) => r.data.data),

  rujukKeluar: (id: number, payload: RujukanKeluarPayload): Promise<Kunjungan> =>
    apiClient
      .post<ApiSuccessResponse<Kunjungan>>(`/kunjungan/${id}/rujukan-keluar`, payload)
      .then((r) => r.data.data),

  createBooking: (payload: CreateBookingPayload): Promise<Kunjungan> =>
    apiClient.post<ApiSuccessResponse<Kunjungan>>('/kunjungan/booking', payload).then((r) => r.data.data),

  checkin: (id: number): Promise<Kunjungan> =>
    apiClient.post<ApiSuccessResponse<Kunjungan>>(`/kunjungan/${id}/checkin`).then((r) => r.data.data),

  panggil: (id: number): Promise<Kunjungan> =>
    apiClient.post<ApiSuccessResponse<Kunjungan>>(`/kunjungan/${id}/panggil`).then((r) => r.data.data),

  selesai: (id: number): Promise<Kunjungan> =>
    apiClient.post<ApiSuccessResponse<Kunjungan>>(`/kunjungan/${id}/selesai`).then((r) => r.data.data),

  batal: (id: number, alasan_batal: string): Promise<Kunjungan> =>
    apiClient
      .post<ApiSuccessResponse<Kunjungan>>(`/kunjungan/${id}/batal`, { alasan_batal })
      .then((r) => r.data.data),
}
