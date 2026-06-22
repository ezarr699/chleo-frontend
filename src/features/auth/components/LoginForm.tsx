/**
 * ============================================================
 * @module      auth
 * @layer       component
 * @file        LoginForm.tsx
 * @path        src/features/auth/components/LoginForm.tsx
 * @description Form login: email & password, menampilkan error validasi
 *              (custom, bukan native browser tooltip) dan kredensial salah
 *              dari backend.
 * @ui          shadcn/ui: Card, Field, FieldError, Label, Input, Button, Alert
 * @since       v1.0.0
 * ============================================================
 */

import { useState } from 'react'
import type { FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { useLogin } from '../hooks/useLogin'

interface FormErrors {
  email?: string
  password?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const login = useLogin()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (!email.trim()) nextErrors.email = 'Email wajib diisi.'
    else if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = 'Format email tidak valid.'
    if (!password) nextErrors.password = 'Password wajib diisi.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    login.mutate({ email, password })
  }

  function handleEmailChange(value: string) {
    setEmail(value)
    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
  }

  function handlePasswordChange(value: string) {
    setPassword(value)
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
  }

  const serverErrorMessage = isAxiosError(login.error)
    ? (login.error.response?.data?.errors?.email?.[0] as string | undefined) ??
      'Email atau password salah.'
    : undefined

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Masuk ke Chleo</CardTitle>
        <CardDescription>Gunakan email dan password akun kamu.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {login.isError && (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{serverErrorMessage}</AlertDescription>
            </Alert>
          )}

          <Field data-invalid={Boolean(errors.email)}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>

          <Field data-invalid={Boolean(errors.password)}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
            />
            {errors.password && <FieldError>{errors.password}</FieldError>}
          </Field>

          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
