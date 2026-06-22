/**
 * ============================================================
 * @module      master-data
 * @layer       hook
 * @file        useUpdateMasterData.ts
 * @path        src/features/master-data/hooks/useUpdateMasterData.ts
 * @description Hook untuk memperbarui data master.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { masterDataService } from '../services/masterDataService'
import type { MasterDataPayload } from '../types'

export function useUpdateMasterData(resource: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: MasterDataPayload }) =>
      masterDataService.update(resource, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', resource] })
    },
  })
}
