/**
 * ============================================================
 * @module      registrasi
 * @layer       hook
 * @file        useRujukanMasuk.ts
 * @path        src/features/registrasi/hooks/useRujukanMasuk.ts
 * @description Hook untuk registrasi kunjungan rujukan masuk (REG-01-2).
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registrasiService } from '../services/registrasiService'
import type { CreateRujukanMasukPayload } from '../types'

export function useRujukanMasuk() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRujukanMasukPayload) => registrasiService.createRujukanMasuk(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kunjungan'] })
    },
  })
}
