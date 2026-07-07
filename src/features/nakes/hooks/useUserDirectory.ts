/**
 * ============================================================
 * @module      nakes
 * @layer       hook
 * @file        useUserDirectory.ts
 * @path        src/features/nakes/hooks/useUserDirectory.ts
 * @description Hook untuk fetch direktori user (dipakai Combobox pemilihan
 *              user di form Profil Nakes). Tidak paginated — daftar staf
 *              tenant diasumsikan cukup kecil untuk dimuat sekaligus.
 * @since       v1.0.0
 * ============================================================
 */

import { useQuery } from '@tanstack/react-query'
import { userDirectoryService } from '../services/userDirectoryService'

export function useUserDirectory() {
  return useQuery({
    queryKey: ['users-directory'],
    queryFn: () => userDirectoryService.list(),
    staleTime: 1000 * 60,
  })
}
