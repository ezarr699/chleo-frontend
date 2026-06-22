/**
 * ============================================================
 * @module      auth
 * @layer       test > e2e > visual
 * @file        login.spec.ts
 * @path        tests/e2e/auth/login.spec.ts
 * @description Pengujian visual UI halaman Login:
 *              - Tampilan form login muncul dengan benar
 *              - Alur login sukses mengarahkan ke halaman utama
 *              - Pesan error tampil saat kredensial salah
 *              - Akses ke '/' tanpa login diarahkan ke '/login'
 * @ui          shadcn/ui: Card, Field, Input, Button, Alert
 * @since       v1.0.0
 * ============================================================
 */

import { test, expect } from '@playwright/test'

test.describe('Halaman Login', () => {
  test('redirect ke /login ketika belum login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })

  test('menampilkan form login dengan elemen shadcn yang benar', async ({ page }) => {
    await page.goto('/login')

    await expect(page.getByText('Masuk ke Chleo')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Email')).toHaveAttribute('type', 'email')
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel('Password')).toHaveAttribute('type', 'password')
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
  })

  test('berhasil login dan redirect ke halaman utama', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('admin@chleo.test')
    await page.getByLabel('Password').fill('password')
    await page.getByRole('button', { name: 'Masuk' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('Selamat datang,')).toBeVisible()
  })

  test('menampilkan pesan error saat kredensial salah', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('salah@example.com')
    await page.getByLabel('Password').fill('salahpassword')
    await page.getByRole('button', { name: 'Masuk' }).click()

    const errorAlert = page.getByRole('alert')
    await expect(errorAlert).toBeVisible()
  })
})
