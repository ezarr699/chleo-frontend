/**
 * ============================================================
 * @module      pasien
 * @layer       test > e2e > visual
 * @file        pasien.spec.ts
 * @path        tests/e2e/pasien/pasien.spec.ts
 * @description Pengujian visual UI alur Pasien end-to-end:
 *              - Tambah pasien baru -> status "Belum Verifikasi"
 *              - Buka dialog verifikasi, isi step 1 (termasuk upload
 *                foto), lewati step 2 & 3 (opsional), submit
 *              - Status berubah jadi "Aktif" di daftar
 *              - Tombol "Nonaktifkan" mengubah status jadi "Nonaktif"
 * @ui          shadcn/ui: Table, Dialog, Field, Input, Combobox, Badge
 * @since       v1.0.0
 * ============================================================
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

// PasienListPage punya DUA layout serentak di DOM — `<Table>` (>= xl) dan
// kartu bertumpuk (< xl), cuma satu yang `display:block` tergantung lebar
// viewport (lihat PasienListPage.tsx). `getByRole('row', ...)` cuma cocok
// untuk <tr>, jadi tidak ketemu apa pun saat proyek "mobile" render kartu.
// Keduanya diberi `data-testid="pasien-row"` yang sama; `:visible` di sini
// memastikan cuma yang sedang tampil (bukan yang `display:none`) yang match.
function pasienRow(page: Page, nama: string) {
  return page.locator('[data-testid="pasien-row"]:visible').filter({ hasText: nama })
}

// PNG 1x1 minimal — backend memvalidasi `image` (jpg/png/gif/bmp/webp,
// TIDAK termasuk svg secara default di Laravel), jadi butuh raster asli.
const ONE_PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

function writeTempPng(): string {
  const filePath = path.join(os.tmpdir(), `pasien-foto-${Date.now()}.png`)
  fs.writeFileSync(filePath, ONE_PIXEL_PNG)
  return filePath
}

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('admin@chleo.test')
  await page.getByLabel('Password').fill('password')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await page.waitForURL('/')
})

test.describe('Pasien', () => {
  test('tambah, verifikasi, lalu nonaktifkan pasien', async ({ page }) => {
    await page.goto('/pasien')

    const nik = Date.now().toString().padStart(16, '0').slice(-16)
    const nama = `Pasien E2E ${Date.now()}`

    await page.getByRole('button', { name: 'Tambah Pasien' }).click()
    await page.getByLabel('NIK').fill(nik)
    await page.getByLabel('Nama').fill(nama)
    await page.getByLabel('Tanggal Lahir').fill('1990-05-10')
    await page.getByLabel('Jenis Kelamin').click()
    await page.getByRole('option').first().click()
    await page.getByRole('button', { name: 'Simpan' }).click()

    const row = pasienRow(page, nama)
    await expect(row).toBeVisible()
    await expect(row.getByText('Belum Verifikasi')).toBeVisible()

    await row.getByRole('button', { name: 'Verifikasi' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Verifikasi Pasien', { exact: true })).toBeVisible()
    await expect(dialog.getByText(nama, { exact: false })).toBeVisible()

    await dialog.getByLabel('Foto').setInputFiles(writeTempPng())
    await page.getByRole('button', { name: 'Gunakan Foto' }).click()
    await dialog.getByLabel('Tempat Lahir').click()
    await page.getByRole('option').first().click()
    await dialog.getByLabel('Golongan Darah').click()
    await page.getByRole('option').first().click()
    await dialog.getByLabel('Nomor Telepon').fill('081234567890')
    await dialog.getByLabel('Alamat Lengkap').fill('Jl. Merdeka No. 1')
    await dialog.getByRole('button', { name: 'Lanjut' }).click()

    await dialog.getByRole('button', { name: 'Lanjut' }).click()

    await dialog.getByRole('button', { name: 'Simpan & Verifikasi' }).click()

    await expect(dialog).not.toBeVisible()
    const verifiedRow = pasienRow(page, nama)
    await expect(verifiedRow.getByText('Aktif', { exact: true })).toBeVisible()

    await verifiedRow.getByRole('button', { name: 'Nonaktifkan' }).click()
    await expect(verifiedRow.getByText('Nonaktif', { exact: true })).toBeVisible()
  })

  test('verifikasi pasien dengan wilayah administratif berjenjang', async ({ page }) => {
    await page.goto('/pasien')

    const nik = Date.now().toString().padStart(16, '0').slice(-16)
    const nama = `Pasien E2E Wilayah ${Date.now()}`

    await page.getByRole('button', { name: 'Tambah Pasien' }).click()
    await page.getByLabel('NIK').fill(nik)
    await page.getByLabel('Nama').fill(nama)
    await page.getByLabel('Tanggal Lahir').fill('1990-05-10')
    await page.getByLabel('Jenis Kelamin').click()
    await page.getByRole('option').first().click()
    await page.getByRole('button', { name: 'Simpan' }).click()

    const row = pasienRow(page, nama)
    await row.getByRole('button', { name: 'Verifikasi' }).click()
    const dialog = page.getByRole('dialog')

    await dialog.getByLabel('Foto').setInputFiles(writeTempPng())
    await page.getByRole('button', { name: 'Gunakan Foto' }).click()
    await dialog.getByLabel('Tempat Lahir').click()
    await page.getByRole('option').first().click()
    await dialog.getByLabel('Golongan Darah').click()
    await page.getByRole('option').first().click()
    await dialog.getByLabel('Nomor Telepon').fill('081234567890')

    // Kabupaten/Kota harus disabled sampai Provinsi dipilih.
    await expect(dialog.getByLabel('Kabupaten/Kota')).toBeDisabled()

    await dialog.getByLabel('Provinsi').click()
    await page.getByRole('option').first().click()
    await expect(dialog.getByLabel('Kabupaten/Kota')).toBeEnabled()

    await dialog.getByLabel('Kabupaten/Kota').click()
    await page.getByRole('option').first().click()
    await expect(dialog.getByLabel('Kecamatan')).toBeEnabled()

    await dialog.getByLabel('Kecamatan').click()
    await page.getByRole('option').first().click()
    await expect(dialog.getByLabel('Kelurahan/Desa')).toBeEnabled()

    await dialog.getByLabel('Kelurahan/Desa').click()
    await page.getByRole('option').first().click()

    await dialog.getByLabel('Alamat Lengkap (Jalan, RT/RW, dst.)').fill('Jl. Merdeka No. 1')
    await dialog.getByRole('button', { name: 'Lanjut' }).click()
    await dialog.getByRole('button', { name: 'Lanjut' }).click()
    await dialog.getByRole('button', { name: 'Simpan & Verifikasi' }).click()

    await expect(dialog).not.toBeVisible()
    const verifiedRow = pasienRow(page, nama)
    await expect(verifiedRow.getByText('Aktif', { exact: true })).toBeVisible()
  })

  test('deteksi lokasi otomatis mengisi wilayah dari koordinat browser saat dialog dibuka', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['geolocation'])
    await context.setGeolocation({ latitude: -6.9, longitude: 107.7 })

    await page.route('**/wilayah/deteksi-lokasi**', (route) =>
      route.fulfill({
        json: {
          success: true,
          message: 'Lokasi berhasil dideteksi.',
          data: {
            provinsi: { code: '32', name: 'JAWA BARAT' },
            kabupaten: { code: '3204', name: 'KABUPATEN BANDUNG' },
            kecamatan: { code: '320405', name: 'CILEUNYI' },
            kelurahan: { code: '3204052001', name: 'CILEUNYI KULON' },
          },
        },
      }),
    )

    await page.goto('/pasien')

    const nik = Date.now().toString().padStart(16, '0').slice(-16)
    const nama = `Pasien E2E Lokasi ${Date.now()}`

    await page.getByRole('button', { name: 'Tambah Pasien' }).click()
    await page.getByLabel('NIK').fill(nik)
    await page.getByLabel('Nama').fill(nama)
    await page.getByLabel('Tanggal Lahir').fill('1990-05-10')
    await page.getByLabel('Jenis Kelamin').click()
    await page.getByRole('option').first().click()
    await page.getByRole('button', { name: 'Simpan' }).click()

    const row = pasienRow(page, nama)
    await row.getByRole('button', { name: 'Verifikasi' }).click()
    const dialog = page.getByRole('dialog')

    // Deteksi lokasi terpicu otomatis saat dialog terbuka — tidak ada
    // tombol manual lagi, jadi tinggal tunggu hasilnya terisi sendiri.
    // Field wilayah sekarang Combobox (input teks), bukan Select (button),
    // jadi nilainya dicek lewat toHaveValue bukan toContainText.
    await expect(dialog.getByLabel('Provinsi')).toHaveValue('JAWA BARAT')
    await expect(dialog.getByLabel('Kabupaten/Kota')).toHaveValue('KABUPATEN BANDUNG')
    await expect(dialog.getByLabel('Kecamatan')).toHaveValue('CILEUNYI')
    await expect(dialog.getByLabel('Kelurahan/Desa')).toHaveValue('CILEUNYI KULON')
  })

  test('verifikasi pasien dengan lebih dari satu entri asuransi tambahan', async ({ page }) => {
    await page.goto('/pasien')

    const nik = Date.now().toString().padStart(16, '0').slice(-16)
    const nama = `Pasien E2E Multi ${Date.now()}`

    await page.getByRole('button', { name: 'Tambah Pasien' }).click()
    await page.getByLabel('NIK').fill(nik)
    await page.getByLabel('Nama').fill(nama)
    await page.getByLabel('Tanggal Lahir').fill('1990-05-10')
    await page.getByLabel('Jenis Kelamin').click()
    await page.getByRole('option').first().click()
    await page.getByRole('button', { name: 'Simpan' }).click()

    const row = pasienRow(page, nama)
    await row.getByRole('button', { name: 'Verifikasi' }).click()
    const dialog = page.getByRole('dialog')

    await dialog.getByLabel('Foto').setInputFiles(writeTempPng())
    await page.getByRole('button', { name: 'Gunakan Foto' }).click()
    await dialog.getByLabel('Tempat Lahir').click()
    await page.getByRole('option').first().click()
    await dialog.getByLabel('Golongan Darah').click()
    await page.getByRole('option').first().click()
    await dialog.getByLabel('Nomor Telepon').fill('081234567890')
    await dialog.getByLabel('Alamat Lengkap').fill('Jl. Merdeka No. 1')
    await dialog.getByRole('button', { name: 'Lanjut' }).click()
    await dialog.getByRole('button', { name: 'Lanjut' }).click()

    // Tambah 2 entri asuransi sekaligus.
    await dialog.getByRole('button', { name: 'Tambah Asuransi' }).click()
    await dialog.getByRole('button', { name: 'Tambah Asuransi' }).click()
    await expect(dialog.getByText('Asuransi #2', { exact: true })).toBeVisible()

    await dialog.getByLabel('Asuransi').first().click()
    await page.getByRole('option', { name: 'Prudential' }).click()
    await dialog.getByLabel('Nomor Polis').first().fill('POL-001')

    await dialog.getByLabel('Asuransi').nth(1).click()
    await page.getByRole('option', { name: 'AXA Mandiri' }).click()
    await dialog.getByLabel('Nomor Polis').nth(1).fill('POL-002')

    await dialog.getByRole('button', { name: 'Simpan & Verifikasi' }).click()

    await expect(dialog).not.toBeVisible()
    const verifiedRow = pasienRow(page, nama)
    await expect(verifiedRow.getByText('Aktif', { exact: true })).toBeVisible()
  })
})
