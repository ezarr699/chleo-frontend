/**
 * ============================================================
 * @module      nakes
 * @layer       service
 * @file        nakesService.ts
 * @path        src/features/nakes/services/nakesService.ts
 * @description Semua pemanggilan API endpoint /profil-nakes.
 * @since       v1.0.0
 * ============================================================
 */

import { apiClient } from '@/shared/api/client'
import type { ApiSuccessResponse } from '@/shared/api/types'
import type { ProfilNakes, ProfilNakesListResult, ProfilNakesPayload } from '../types'

export const nakesService = {
  list: (page = 1, perPage = 15): Promise<ProfilNakesListResult> =>
    apiClient
      .get<ApiSuccessResponse<ProfilNakes[]>>('/profil-nakes', { params: { page, per_page: perPage } })
      .then((r) => ({
        items: r.data.data,
        currentPage: r.data.meta?.current_page ?? page,
        perPage: r.data.meta?.per_page ?? perPage,
        total: r.data.meta?.total ?? r.data.data.length,
      })),

  create: (payload: ProfilNakesPayload): Promise<ProfilNakes> =>
    apiClient.post<ApiSuccessResponse<ProfilNakes>>('/profil-nakes', payload).then((r) => r.data.data),

  update: (id: number, payload: ProfilNakesPayload): Promise<ProfilNakes> =>
    apiClient.put<ApiSuccessResponse<ProfilNakes>>(`/profil-nakes/${id}`, payload).then((r) => r.data.data),

  remove: (id: number): Promise<void> => apiClient.delete(`/profil-nakes/${id}`).then(() => undefined),
}
