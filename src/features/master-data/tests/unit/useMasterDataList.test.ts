/**
 * ============================================================
 * @module      master-data
 * @layer       test > unit
 * @file        useMasterDataList.test.ts
 * @path        src/features/master-data/tests/unit/useMasterDataList.test.ts
 * @description Unit test untuk hook useMasterDataList: loading, sukses.
 * @covers      src/features/master-data/hooks/useMasterDataList.ts
 * @since       v1.0.0
 * ============================================================
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useMasterDataList } from '../../hooks/useMasterDataList'
import { masterDataService } from '../../services/masterDataService'
import { createWrapper } from '../../../../../tests/unit/utils/queryWrapper'

vi.mock('../../services/masterDataService')

describe('useMasterDataList', () => {
  it('returns the list on success', async () => {
    const mockResult = {
      items: [{ id: 1, name: 'Islam', created_at: '', updated_at: '' }],
      currentPage: 1,
      perPage: 15,
      total: 1,
    }
    vi.mocked(masterDataService.list).mockResolvedValueOnce(mockResult)

    const { result } = renderHook(() => useMasterDataList('agama', 1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResult)
  })

  it('returns error state on API failure', async () => {
    vi.mocked(masterDataService.list).mockRejectedValueOnce(new Error('Network Error'))

    const { result } = renderHook(() => useMasterDataList('agama', 1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
