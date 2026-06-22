/**
 * ============================================================
 * @module      auth
 * @layer       hook
 * @file        useAuthSession.ts
 * @path        src/features/auth/hooks/useAuthSession.ts
 * @description Hook untuk memeriksa sesi login user saat ini (GET /auth/me).
 * @since       v1.0.0
 * @ref         https://tanstack.com/query/latest/docs/framework/react/guides/queries
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query'
import { authService } from '../services/authService'

export function useAuthSession() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })
}
