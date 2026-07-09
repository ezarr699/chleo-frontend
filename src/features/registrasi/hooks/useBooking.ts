/**
 * ============================================================
 * @module      registrasi
 * @layer       hook
 * @file        useBooking.ts
 * @path        src/features/registrasi/hooks/useBooking.ts
 * @description Hook untuk membuat online booking (REG-01-3) lewat
 *              Mobile JKN atau Web Portal.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registrasiService } from '../services/registrasiService'
import type { CreateBookingPayload } from '../types'

export function useBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => registrasiService.createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kunjungan'] })
    },
  })
}
