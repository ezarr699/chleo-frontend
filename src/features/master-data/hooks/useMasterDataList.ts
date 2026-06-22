/**
 * ============================================================
 * @module      master-data
 * @layer       hook
 * @file        useMasterDataList.ts
 * @path        src/features/master-data/hooks/useMasterDataList.ts
 * @description Hook untuk fetch daftar data master (paginated).
 * @since       v1.0.0
 * @ref         https://tanstack.com/query/latest/docs/framework/react/guides/queries
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query'
import { masterDataService } from '../services/masterDataService'

export function useMasterDataList(resource: string, page: number, perPage = 15) {
  return useQuery({
    queryKey: ['master-data', resource, page, perPage],
    queryFn: () => masterDataService.list(resource, page, perPage),
    staleTime: 1000 * 60,
  })
}
