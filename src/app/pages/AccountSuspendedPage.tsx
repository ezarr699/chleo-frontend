/**
 * ============================================================
 * @module      app
 * @layer       component
 * @file        AccountSuspendedPage.tsx
 * @path        src/app/pages/AccountSuspendedPage.tsx
 * @description Halaman informasi saat akun perusahaan (tenant) sedang
 *              ditangguhkan oleh admin pusat. Ditampilkan lewat full-page
 *              redirect dari interceptor axios (lihat shared/api/client.ts)
 *              ketika backend mengembalikan kode `tenant_suspended` —
 *              menggantikan perilaku lama yang hanya diam-diam logout
 *              tanpa penjelasan.
 * @ui          shadcn/ui: Card, Alert
 * @since       v1.0.0
 * ============================================================
 */

import { CircleAlertIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

export function AccountSuspendedPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Akun Ditangguhkan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Akses perusahaan ini sedang ditangguhkan</AlertTitle>
            <AlertDescription>
              Untuk informasi lebih lanjut atau mengaktifkan kembali akses, silakan hubungi tim
              dukungan Chleo.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </main>
  )
}
