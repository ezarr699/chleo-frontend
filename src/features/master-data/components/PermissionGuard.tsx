/**
 * ============================================================
 * @module      master-data
 * @layer       component
 * @file        PermissionGuard.tsx
 * @path        src/features/master-data/components/PermissionGuard.tsx
 * @description Membatasi akses route ke user yang punya permission
 *              tertentu. Analog dengan AuthGuard, tapi untuk RBAC.
 *              Ini hanya defense-in-depth UX — penegakan sesungguhnya
 *              ada di middleware `permission:` backend.
 * @since       v1.0.0
 * ============================================================
 */

import { Navigate, Outlet } from 'react-router'
import { useAuthSession } from '@/features/auth'

export function PermissionGuard({ permission }: { permission: string }) {
  const { data: user, isLoading } = useAuthSession()

  if (isLoading) return null

  if (!user?.permissions.includes(permission)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
