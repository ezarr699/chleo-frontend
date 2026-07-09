/**
 * ============================================================
 * @module      registrasi
 * @layer       hook
 * @file        useRujukanKeluar.ts
 * @path        src/features/registrasi/hooks/useRujukanKeluar.ts
 * @description Hook untuk merujuk keluar kunjungan yang sedang
 *              berjalan (REG-01-2) ke faskes lain.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registrasiService } from '../services/registrasiService'
import type { RujukanKeluarPayload } from '../types'

export function useRujukanKeluar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RujukanKeluarPayload }) =>
      registrasiService.rujukKeluar(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kunjungan'] })
    },
  })
}
