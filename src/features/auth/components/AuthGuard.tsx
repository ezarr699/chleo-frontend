/**
 * ============================================================
 * @module      auth
 * @layer       component
 * @file        AuthGuard.tsx
 * @path        src/features/auth/components/AuthGuard.tsx
 * @description Membatasi akses route ke user yang sudah login.
 *              Mengarahkan ke /login jika sesi tidak valid.
 * @ui          shadcn/ui: Skeleton
 * @since       v1.0.0
 * ============================================================
 */

import { Navigate, Outlet } from 'react-router'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useAuthSession } from '../hooks/useAuthSession'

export function AuthGuard() {
  const { data: user, isLoading, isError } = useAuthSession()

  if (isLoading) {
    return (
      <main className="flex min-h-svh items-center justify-center p-4">
        <Skeleton className="h-32 w-full max-w-sm" />
      </main>
    )
  }

  if (isError || !user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
