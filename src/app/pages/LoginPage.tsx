/**
 * ============================================================
 * @module      app
 * @layer       component
 * @file        LoginPage.tsx
 * @path        src/app/pages/LoginPage.tsx
 * @description Halaman login.
 * @since       v1.0.0
 * ============================================================
 */

import { LoginForm } from '@/features/auth'

export function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <LoginForm />
    </main>
  )
}
