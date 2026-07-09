/**
 * ============================================================
 * @module      registrasi
 * @layer       hook
 * @file        useKunjunganTransisi.ts
 * @path        src/features/registrasi/hooks/useKunjunganTransisi.ts
 * @description Hook untuk transisi status antrian kunjungan: checkin
 *              (booking -> menunggu), panggil (menunggu -> dipanggil),
 *              dan selesai. Satu hook karena ketiganya adalah satu
 *              tanggung jawab yang sama — mengubah status kunjungan
 *              lewat action string, bukan endpoint terpisah yang tak
 *              berhubungan.
 * @since       v1.0.0
 * ============================================================
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { registrasiService } from '../services/registrasiService'

export type AksiTransisiKunjungan = 'checkin' | 'panggil' | 'selesai'

export function useKunjunganTransisi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, aksi }: { id: number; aksi: AksiTransisiKunjungan }) =>
      registrasiService[aksi](id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kunjungan'] })
    },
  })
}
