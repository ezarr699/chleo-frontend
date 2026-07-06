/**
 * ============================================================
 * @module      pasien
 * @layer       hook
 * @file        useCreatePasien.ts
 * @path        src/features/pasien/hooks/useCreatePasien.ts
 * @description Hook untuk menambah pasien baru (4 field minimal).
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pasienService } from '../services/pasienService'
import type { CreatePasienPayload } from '../types'

export function useCreatePasien() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreatePasienPayload) => pasienService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pasien'] })
    },
  })
}
