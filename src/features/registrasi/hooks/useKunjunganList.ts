/**
 * ============================================================
 * @module      registrasi
 * @layer       hook
 * @file        useKunjunganList.ts
 * @path        src/features/registrasi/hooks/useKunjunganList.ts
 * @description Hook untuk fetch daftar kunjungan (paginated).
 * @since       v1.0.0
 * @ref         https://tanstack.com/query/latest/docs/framework/react/guides/queries
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query'
import { registrasiService } from '../services/registrasiService'

export function useKunjunganList(page: number, perPage = 15) {
  return useQuery({
    queryKey: ['kunjungan', page, perPage],
    queryFn: () => registrasiService.list(page, perPage),
    staleTime: 1000 * 15,
  })
}
