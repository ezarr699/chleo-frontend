/**
 * ============================================================
 * @module      pasien
 * @layer       hook
 * @file        useSetPasienStatus.ts
 * @path        src/features/pasien/hooks/useSetPasienStatus.ts
 * @description Hook untuk toggle status pasien aktif/nonaktif (hanya
 *              berlaku untuk pasien yang sudah pernah diverifikasi).
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pasienService } from '../services/pasienService'

export function useSetPasienStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, aktif }: { id: number; aktif: boolean }) =>
      pasienService.setStatus(id, aktif),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pasien'] })
    },
  })
}
