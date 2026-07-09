/**
 * ============================================================
 * @module      registrasi
 * @layer       hook
 * @file        useCreateKunjunganLangsung.ts
 * @path        src/features/registrasi/hooks/useCreateKunjunganLangsung.ts
 * @description Hook untuk registrasi kunjungan langsung/walk-in (REG-01-1).
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registrasiService } from '../services/registrasiService'
import type { CreateWalkInPayload } from '../types'

export function useCreateKunjunganLangsung() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateWalkInPayload) => registrasiService.createWalkIn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kunjungan'] })
    },
  })
}
