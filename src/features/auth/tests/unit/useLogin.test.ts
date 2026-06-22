/**
 * ============================================================
 * @module      auth
 * @layer       test > unit
 * @file        useLogin.test.ts
 * @path        src/features/auth/tests/unit/useLogin.test.ts
 * @description Unit test untuk hook useLogin: sukses redirect ke '/',
 *              dan gagal tetap di halaman tanpa redirect.
 * @covers      src/features/auth/hooks/useLogin.ts
 * @since       v1.0.0
 * ============================================================
 */

import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useLogin } from '../../hooks/useLogin'
import { authService } from '../../services/authService'
import { createWrapper } from '../../../../../tests/unit/utils/queryWrapper'

const navigateMock = vi.fn()

vi.mock('react-router', () => ({
  useNavigate: () => navigateMock,
}))

vi.mock('../../services/authService')

describe('useLogin', () => {
  beforeEach(() => {
    navigateMock.mockClear()
  })

  it('redirects to home on successful login', async () => {
    const user = { id: 1, name: 'Budi', email: 'budi@example.com', permissions: [] }
    vi.mocked(authService.login).mockResolvedValueOnce(user)

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'budi@example.com', password: 'Password123!' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(navigateMock).toHaveBeenCalledWith('/')
  })

  it('does not redirect when login fails', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce(new Error('Unauthorized'))

    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() })

    result.current.mutate({ email: 'budi@example.com', password: 'salah' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(navigateMock).not.toHaveBeenCalled()
  })
})
