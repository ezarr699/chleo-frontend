/**
 * ============================================================
 * @module      master-data
 * @layer       test > e2e > visual
 * @file        golongan-darah.spec.ts
 * @path        tests/e2e/master-data/golongan-darah.spec.ts
 * @description Pengujian visual UI CRUD data master Golongan Darah
 *              (sebagai representasi — logic generik dipakai modul
 *              JenisKelamin juga):
 *              - Sidebar menampilkan menu "Data Master"
 *              - List tampil, create lewat dialog, delete lewat konfirmasi
 * @ui          shadcn/ui: Table, Dialog, AlertDialog, Button, Field, Input
 * @since       v1.0.0
 * ============================================================
 */

import { test, expect, type Page } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@chleo.test')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await page.waitForURL('/')
})

async function openSidebarIfCollapsed(page: Page) {
  const viewport = page.viewportSize()
  const isMobileViewport = !!viewport && viewport.width < 768

  if (isMobileViewport) {
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click()
  }

  await page.getByRole('link', { name: 'Data Master' }).waitFor({ state: 'visible' })
}

test.describe('Data Master - Golongan Darah', () => {
  test('menampilkan menu Data Master di sidebar untuk admin', async ({ page }) => {
    await openSidebarIfCollapsed(page)

    await page
      .getByRole('link', { name: 'Data Master' })
      .locator('..')
      .getByRole('button', { name: 'Toggle' })
      .click()
    await expect(page.getByRole('link', { name: 'Golongan Darah' })).toBeVisible()
  });

  test('membuat data golongan darah baru lewat dialog', async ({ page }) => {
    await page.goto('/master-data/golongan-darah')

    const uniqueName = `GD Test ${Date.now()}`

    await page.getByRole('button', { name: 'Tambah Golongan Darah' }).click()
    await page.getByLabel('Nama').fill(uniqueName)
    await page.getByRole('button', { name: 'Simpan' }).click()

    await expect(page.getByText(uniqueName)).toBeVisible()
  })

  test('menghapus data golongan darah lewat konfirmasi', async ({ page }) => {
    await page.goto('/master-data/golongan-darah')

    const uniqueName = `GD Hapus ${Date.now()}`

    await page.getByRole('button', { name: 'Tambah Golongan Darah' }).click()
    await page.getByLabel('Nama').fill(uniqueName)
    await page.getByRole('button', { name: 'Simpan' }).click()
    await expect(page.getByText(uniqueName)).toBeVisible()

    await page
      .getByRole('row', { name: new RegExp(uniqueName) })
      .getByRole('button', { name: 'Hapus' })
      .click()
    await page.getByRole('button', { name: 'Hapus' }).last().click()

    await expect(page.getByText(uniqueName)).not.toBeVisible()
  })
})
