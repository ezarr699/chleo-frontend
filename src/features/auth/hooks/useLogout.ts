/**
 * ============================================================
 * @module      auth
 * @layer       hook
 * @file        useLogout.ts
 * @path        src/features/auth/hooks/useLogout.ts
 * @description Custom hook untuk logout: hapus sesi di backend,
 *              bersihkan cache user, lalu redirect ke /login.
 * @since       v1.0.0
 * @ref         https://tanstack.com/query/latest/docs/framework/react/guides/mutations
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authService } from '../services/authService'

export function useLogout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null)
      navigate('/login')
    },
  })
}
