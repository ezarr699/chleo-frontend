/**
 * ============================================================
 * @module      app
 * @layer       component
 * @file        DashboardPage.tsx
 * @path        src/app/pages/DashboardPage.tsx
 * @description Halaman overview dashboard. Placeholder sampai modul
 *              bisnis lain ditambahkan di src/features/.
 * @ui          shadcn/ui: Card
 * @since       v1.0.0
 * ============================================================
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useAuthSession } from '@/features/auth'

export function DashboardPage() {
  const { data: user } = useAuthSession()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selamat datang, {user?.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">
          Belum ada modul lain selain Auth. Tambahkan feature module baru di{' '}
          <code>src/features/</code>, lalu daftarkan menu navigasinya di{' '}
          <code>src/app/layouts/DashboardLayout.tsx</code>.
        </p>
      </CardContent>
    </Card>
  )
}
