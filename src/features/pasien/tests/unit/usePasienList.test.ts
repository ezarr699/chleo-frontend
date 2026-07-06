/**
 * ============================================================
 * @module      pasien
 * @layer       test > unit
 * @file        usePasienList.test.ts
 * @path        src/features/pasien/tests/unit/usePasienList.test.ts
 * @description Unit test untuk hook usePasienList: loading, sukses, error.
 * @covers      src/features/pasien/hooks/usePasienList.ts
 * @since       v1.0.0
 * ============================================================
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { usePasienList } from '../../hooks/usePasienList'
import { pasienService } from '../../services/pasienService'
import { createWrapper } from '../../../../../tests/unit/utils/queryWrapper'

vi.mock('../../services/pasienService')

describe('usePasienList', () => {
  it('returns the list on success', async () => {
    const mockResult = {
      items: [
        {
          id: 1,
          nik: '1234567890123456',
          nama: 'Budi Santoso',
          tanggal_lahir: '1990-05-10',
          jenis_kelamin: { id: 1, name: 'Laki-laki' },
          status: 'belum_verifikasi' as const,
          foto_url: null,
          tempat_lahir: null,
          golongan_darah: null,
          nomor_telepon: null,
          alamat: null,
          provinsi: null,
          kabupaten: null,
          kecamatan: null,
          kelurahan: null,
          bpjs_nomor: null,
          bpjs_jenis_peserta: null,
          bpjs_kelas: null,
          bpjs_nama_fasyankes: null,
          bpjs_kode_fasyankes: null,
          bpjs_masa_berlaku: null,
          asuransi_list: [],
          verified_at: null,
          created_at: '',
          updated_at: '',
        },
      ],
      currentPage: 1,
      perPage: 15,
      total: 1,
    }
    vi.mocked(pasienService.list).mockResolvedValueOnce(mockResult)

    const { result } = renderHook(() => usePasienList(1), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResult)
  })

  it('returns error state on API failure', async () => {
    vi.mocked(pasienService.list).mockRejectedValueOnce(new Error('Network Error'))

    const { result } = renderHook(() => usePasienList(1), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
