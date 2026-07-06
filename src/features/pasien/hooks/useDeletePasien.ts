/**
 * ============================================================
 * @module      pasien
 * @layer       hook
 * @file        useDeletePasien.ts
 * @path        src/features/pasien/hooks/useDeletePasien.ts
 * @description Hook untuk menghapus (soft delete) pasien.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pasienService } from '../services/pasienService'

export function useDeletePasien() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => pasienService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pasien'] })
    },
  })
}
