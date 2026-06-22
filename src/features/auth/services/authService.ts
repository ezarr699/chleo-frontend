/**
 * ============================================================
 * @module      auth
 * @layer       service
 * @file        authService.ts
 * @path        src/features/auth/services/authService.ts
 * @description Semua pemanggilan API endpoint /auth/* dan
 *              /sanctum/csrf-cookie (Sanctum SPA session auth).
 * @since       v1.0.0
 * @ref         https://laravel.com/docs/13.x/sanctum#spa-authenticating
 * ============================================================
 */

import { apiClient, apiRootClient } from '@/shared/api/client'
import type { ApiSuccessResponse } from '@/shared/api/types'
import type { LoginPayload, User } from '../types'

export const authService = {
  login: async (payload: LoginPayload): Promise<User> => {
    await apiRootClient.get('/sanctum/csrf-cookie')

    const response = await apiClient.post<ApiSuccessResponse<User>>('/auth/login', payload)

    return response.data.data
  },

  logout: (): Promise<void> => apiClient.post('/auth/logout').then(() => undefined),

  me: (): Promise<User> =>
    apiClient.get<ApiSuccessResponse<User>>('/auth/me').then((r) => r.data.data),
}
