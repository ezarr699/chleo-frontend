/**
 * ============================================================
 * @module      nakes
 * @layer       hook
 * @file        useNakesList.ts
 * @path        src/features/nakes/hooks/useNakesList.ts
 * @description Hook untuk fetch daftar profil nakes (paginated).
 * @since       v1.0.0
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query'
import { nakesService } from '../services/nakesService'

export function useNakesList(page: number, perPage = 15) {
  return useQuery({
    queryKey: ['profil-nakes', page, perPage],
    queryFn: () => nakesService.list(page, perPage),
    staleTime: 1000 * 30,
  })
}
