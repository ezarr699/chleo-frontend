/**
 * ============================================================
 * @module      app
 * @layer       component
 * @file        NotFoundPage.tsx
 * @path        src/app/pages/NotFoundPage.tsx
 * @description Halaman 404 kustom, dipakai sebagai errorElement router
 *              supaya halaman not-found tidak menampilkan default error
 *              boundary React Router yang generik.
 * @ui          shadcn/ui: Button
 * @since       v1.0.0
 * ============================================================
 */

import { Link } from 'react-router'
import { Button } from '@/shared/components/ui/button'

export function NotFoundPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-2xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="text-muted-foreground text-sm">
        Halaman yang kamu cari tidak ada atau sudah dipindahkan.
      </p>
      <Button render={<Link to="/" />}>Kembali ke Dashboard</Button>
    </main>
  )
}
