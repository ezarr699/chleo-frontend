/**
 * ============================================================
 * @module      registrasi
 * @layer       hook
 * @file        useBatalKunjungan.ts
 * @path        src/features/registrasi/hooks/useBatalKunjungan.ts
 * @description Hook untuk membatalkan kunjungan (butuh alasan_batal,
 *              jadi dipisah dari useKunjunganTransition yang tidak
 *              punya payload).
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registrasiService } from '../services/registrasiService'

export function useBatalKunjungan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, alasan }: { id: number; alasan: string }) => registrasiService.batal(id, alasan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kunjungan'] })
    },
  })
}
