/**
 * ============================================================
 * @module      master-data
 * @layer       hook
 * @file        useCreateMasterData.ts
 * @path        src/features/master-data/hooks/useCreateMasterData.ts
 * @description Hook untuk membuat data master baru.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { masterDataService } from '../services/masterDataService'
import type { MasterDataPayload } from '../types'

export function useCreateMasterData(resource: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: MasterDataPayload) => masterDataService.create(resource, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', resource] })
    },
  })
}
