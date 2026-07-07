/**
 * ============================================================
 * @module      nakes
 * @layer       service
 * @file        userDirectoryService.ts
 * @path        src/features/nakes/services/userDirectoryService.ts
 * @description Pemanggilan API GET /users — direktori user tenant untuk
 *              Combobox pemilihan user di form Profil Nakes. Endpoint ini
 *              digerbangi permission profil_nakes.manage di backend
 *              (bukan endpoint publik semua user login), jadi memang
 *              hanya relevan dipakai dari fitur ini.
 * @since       v1.0.0
 * ============================================================
 */

import { apiClient } from '@/shared/api/client'
import type { ApiSuccessResponse } from '@/shared/api/types'
import type { UserRef } from '../types'

export const userDirectoryService = {
  list: (): Promise<UserRef[]> =>
    apiClient.get<ApiSuccessResponse<UserRef[]>>('/users').then((r) => r.data.data),
}
