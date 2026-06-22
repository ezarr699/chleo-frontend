/**
 * ============================================================
 * @module      master-data
 * @layer       service
 * @file        masterDataService.ts
 * @path        src/features/master-data/services/masterDataService.ts
 * @description Semua pemanggilan API untuk data master, diparametrisasi
 *              lewat `resource` (mis. "agama", "golongan-darah") supaya
 *              satu service dipakai oleh ke-5 jenis data master.
 * @since       v1.0.0
 * ============================================================
 */

import { apiClient } from '@/shared/api/client'
import type { ApiSuccessResponse } from '@/shared/api/types'
import type { MasterDataItem, MasterDataListResult, MasterDataPayload } from '../types'

export const masterDataService = {
  list: (resource: string, page = 1, perPage = 15): Promise<MasterDataListResult> =>
    apiClient
      .get<ApiSuccessResponse<MasterDataItem[]>>(`/${resource}`, {
        params: { page, per_page: perPage },
      })
      .then((r) => ({
        items: r.data.data,
        currentPage: r.data.meta?.current_page ?? page,
        perPage: r.data.meta?.per_page ?? perPage,
        total: r.data.meta?.total ?? r.data.data.length,
      })),

  create: (resource: string, payload: MasterDataPayload): Promise<MasterDataItem> =>
    apiClient
      .post<ApiSuccessResponse<MasterDataItem>>(`/${resource}`, payload)
      .then((r) => r.data.data),

  update: (resource: string, id: number, payload: MasterDataPayload): Promise<MasterDataItem> =>
    apiClient
      .put<ApiSuccessResponse<MasterDataItem>>(`/${resource}/${id}`, payload)
      .then((r) => r.data.data),

  remove: (resource: string, id: number): Promise<void> =>
    apiClient.delete(`/${resource}/${id}`).then(() => undefined),
}
