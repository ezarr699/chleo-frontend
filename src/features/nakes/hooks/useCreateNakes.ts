/**
 * ============================================================
 * @module      nakes
 * @layer       hook
 * @file        useCreateNakes.ts
 * @path        src/features/nakes/hooks/useCreateNakes.ts
 * @description Hook untuk menambah profil nakes baru.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { nakesService } from '../services/nakesService'
import type { ProfilNakesPayload } from '../types'

export function useCreateNakes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ProfilNakesPayload) => nakesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profil-nakes'] })
    },
  })
}
