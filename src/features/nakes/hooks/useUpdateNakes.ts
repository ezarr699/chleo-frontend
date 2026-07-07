/**
 * ============================================================
 * @module      nakes
 * @layer       hook
 * @file        useUpdateNakes.ts
 * @path        src/features/nakes/hooks/useUpdateNakes.ts
 * @description Hook untuk memperbarui profil nakes.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { nakesService } from '../services/nakesService'
import type { ProfilNakesPayload } from '../types'

export function useUpdateNakes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProfilNakesPayload }) =>
      nakesService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profil-nakes'] })
    },
  })
}
