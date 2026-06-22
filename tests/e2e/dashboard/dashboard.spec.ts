/**
 * ============================================================
 * @module      app
 * @layer       test > e2e > visual
 * @file        dashboard.spec.ts
 * @path        tests/e2e/dashboard/dashboard.spec.ts
 * @description Pengujian visual UI dashboard:
 *              - Sidebar & topbar tampil setelah login
 *              - Menu user (avatar) menampilkan email & opsi logout
 *              - Logout mengarahkan kembali ke /login
 *              Sidebar bersifat off-canvas (sheet) di viewport mobile,
 *              jadi perlu dibuka lewat tombol "Toggle Sidebar" dulu.
 * @ui          shadcn/ui: Avatar, DropdownMenu, Button, Sidebar
 * @since       v1.0.0
 * ============================================================
 */

import { test, expect, type Page } from '@playwright/test'

async function login(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@chleo.test')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await page.waitForURL('/')
}

async function openSidebarIfCollapsed(page: Page) {
  const viewport = page.viewportSize()
  const isMobileViewport = !!viewport && viewport.width < 768

  if (isMobileViewport) {
    await page.getByRole('button', { name: 'Toggle Sidebar' }).click()
  }

  await page.getByRole('button', { name: 'Admin Chleo' }).waitFor({ state: 'visible' })
}

test.describe('Dashboard', () => {
  test('menampilkan sidebar dan topbar setelah login', async ({ page }) => {
    await login(page)
    await openSidebarIfCollapsed(page)

    await expect(page.getByRole('link', { name: 'Dashboard' }).first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Admin Chleo' })).toBeVisible()
  })

  test('menu user menampilkan email dan opsi logout', async ({ page }) => {
    await login(page)
    await openSidebarIfCollapsed(page)

    await page.getByRole('button', { name: 'Admin Chleo' }).click()
    await expect(page.getByRole('menu').getByText('admin@chleo.test')).toBeVisible()
    await expect(page.getByRole('menuitem', { name: 'Logout' })).toBeVisible()
  })

  test('logout mengarahkan kembali ke /login', async ({ page }) => {
    await login(page)
    await openSidebarIfCollapsed(page)

    await page.getByRole('button', { name: 'Admin Chleo' }).click()
    await page.getByRole('menuitem', { name: 'Logout' }).click()

    await expect(page).toHaveURL('/login')
  })
})
