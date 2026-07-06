/**
 * ============================================================
 * @module      app
 * @layer       app > router
 * @file        router.tsx
 * @path        src/app/router.tsx
 * @description Konfigurasi React Router untuk seluruh aplikasi.
 *              Route di bawah AuthGuard hanya bisa diakses setelah login,
 *              dan dibungkus DashboardLayout (sidebar + topbar). Route
 *              data master masing-masing dibungkus PermissionGuard.
 * @since       v1.0.0
 * @ref         https://reactrouter.com/start/declarative/routing
 * ============================================================
 */

import { createBrowserRouter, Navigate } from 'react-router'
import { AuthGuard } from '@/features/auth'
import { PermissionGuard } from '@/features/master-data'
import { PasienListPage } from '@/features/pasien'
import { DashboardLayout } from './layouts/DashboardLayout'
import { AccountSuspendedPage } from './pages/AccountSuspendedPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { GolonganDarahPage } from './pages/master-data/GolonganDarahPage'
import { JenisKelaminPage } from './pages/master-data/JenisKelaminPage'
import { PenjaminPage } from './pages/master-data/PenjaminPage'
import { AsuransiPage } from './pages/master-data/AsuransiPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/account-suspended',
    element: <AccountSuspendedPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: '/',
            element: <DashboardPage />,
          },
          {
            // Link grup "Data Master" di sidebar menuju path ini —
            // alihkan ke item pertama daripada menampilkan halaman kosong.
            path: '/master-data',
            element: <Navigate to="/master-data/golongan-darah" replace />,
          },
          {
            element: <PermissionGuard permission="golongan_darah.view" />,
            children: [
              { path: '/master-data/golongan-darah', element: <GolonganDarahPage /> },
            ],
          },
          {
            element: <PermissionGuard permission="jenis_kelamin.view" />,
            children: [{ path: '/master-data/jenis-kelamin', element: <JenisKelaminPage /> }],
          },
          {
            element: <PermissionGuard permission="penjamin.view" />,
            children: [{ path: '/master-data/penjamin', element: <PenjaminPage /> }],
          },
          {
            element: <PermissionGuard permission="asuransi.view" />,
            children: [{ path: '/master-data/asuransi', element: <AsuransiPage /> }],
          },
          {
            element: <PermissionGuard permission="pasien.view" />,
            children: [{ path: '/pasien', element: <PasienListPage /> }],
          },
        ],
      },
    ],
  },
])
