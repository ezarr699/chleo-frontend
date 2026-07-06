/**
 * ============================================================
 * @module      pasien
 * @layer       hook
 * @file        usePasienList.ts
 * @path        src/features/pasien/hooks/usePasienList.ts
 * @description Hook untuk fetch daftar pasien (paginated).
 * @since       v1.0.0
 * @ref         https://tanstack.com/query/latest/docs/framework/react/guides/queries
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query'
import { pasienService } from '../services/pasienService'

export function usePasienList(page: number, perPage = 15) {
  return useQuery({
    queryKey: ['pasien', page, perPage],
    queryFn: () => pasienService.list(page, perPage),
    staleTime: 1000 * 30,
  })
}
