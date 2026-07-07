/**
 * ============================================================
 * @module      nakes
 * @layer       hook
 * @file        useDeleteNakes.ts
 * @path        src/features/nakes/hooks/useDeleteNakes.ts
 * @description Hook untuk menghapus (soft delete) profil nakes.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { nakesService } from '../services/nakesService'

export function useDeleteNakes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => nakesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profil-nakes'] })
    },
  })
}
