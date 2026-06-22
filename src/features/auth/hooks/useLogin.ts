/**
 * ============================================================
 * @module      auth
 * @layer       hook
 * @file        useLogin.ts
 * @path        src/features/auth/hooks/useLogin.ts
 * @description Custom hook untuk proses login: memanggil authService,
 *              menyimpan ulang cache user, dan redirect ke halaman utama.
 * @since       v1.0.0
 * @ref         https://tanstack.com/query/latest/docs/framework/react/guides/mutations
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authService } from '../services/authService'

export function useLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      queryClient.setQueryData(['auth', 'me'], user)
      navigate('/')
    },
  })
}
