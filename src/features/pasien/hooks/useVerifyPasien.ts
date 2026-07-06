/**
 * ============================================================
 * @module      pasien
 * @layer       hook
 * @file        useVerifyPasien.ts
 * @path        src/features/pasien/hooks/useVerifyPasien.ts
 * @description Hook untuk memverifikasi pasien (melengkapi data +
 *              upload foto). Sukses otomatis mengubah status jadi aktif.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pasienService } from '../services/pasienService'
import type { VerifyPasienPayload } from '../types'

export function useVerifyPasien() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: VerifyPasienPayload }) =>
      pasienService.verify(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pasien'] })
    },
  })
}
