/**
 * ============================================================
 * @module      pasien
 * @layer       hook
 * @file        useUpdatePasien.ts
 * @path        src/features/pasien/hooks/useUpdatePasien.ts
 * @description Hook untuk memperbarui data dasar pasien.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pasienService } from '../services/pasienService'
import type { UpdatePasienPayload } from '../types'

export function useUpdatePasien() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePasienPayload }) =>
      pasienService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pasien'] })
    },
  })
}
