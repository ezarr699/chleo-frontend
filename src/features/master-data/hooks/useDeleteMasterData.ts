/**
 * ============================================================
 * @module      master-data
 * @layer       hook
 * @file        useDeleteMasterData.ts
 * @path        src/features/master-data/hooks/useDeleteMasterData.ts
 * @description Hook untuk menghapus (soft delete) data master.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { masterDataService } from '../services/masterDataService'

export function useDeleteMasterData(resource: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => masterDataService.remove(resource, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-data', resource] })
    },
  })
}
