/**
 * ============================================================
 * @module      pasien
 * @layer       component
 * @file        PasienListPage.tsx
 * @path        src/features/pasien/components/PasienListPage.tsx
 * @description Halaman daftar pasien: Dialog "Tambah Pasien" (4 field
 *              minimal — nik, nama, tanggal lahir, jenis kelamin), tabel
 *              dengan status badge, dan aksi per baris: Verifikasi
 *              (hanya untuk status belum_verifikasi, membuka
 *              PasienVerificationDialog), Aktifkan/Nonaktifkan (hanya
 *              pasien yang sudah pernah diverifikasi), Hapus. Daftar
 *              pasien punya DUA layout — `<Table>` (>= xl, 1280px) dan
 *              kartu bertumpuk (< xl) — karena tabel 5 kolom (~802px)
 *              terlalu lebar untuk layar HP MAUPUN tablet/laptop kecil
 *              dengan sidebar terbuka (di 1024px sisa lebar konten masih
 *              pas-pasan, baru benar-benar lega di >= 1280px). Root cause
 *              overflow-nya sebenarnya bug layout global: `SidebarInset`
 *              (`shared/components/ui/sidebar.tsx`) tadinya tidak punya
 *              `min-w-0`, jadi elemen `<main>` itu (flex item) tidak bisa
 *              menyusut di bawah lebar intrinsik anaknya — akibatnya
 *              SELURUH HALAMAN ikut melebar horizontal (bukan cuma tabel
 *              yang scroll dalam wadahnya sendiri) begitu ada konten
 *              lebar seperti tabel ini. Sudah diperbaiki di sana (dampak
 *              ke semua halaman dashboard, bukan cuma Pasien), tapi
 *              breakpoint `xl` di sini tetap dipertahankan supaya benar-
 *              benar tidak perlu scroll horizontal SAMA SEKALI, bukan cuma
 *              "tidak mendorong halaman lain". `PasienActions` (tombol
 *              Verifikasi/Aktifkan-Nonaktifkan/Hapus) dipakai bareng oleh
 *              kedua layout supaya logikanya tidak dobel. Keduanya diberi
 *              `data-testid="pasien-row"` yang sama supaya e2e test bisa
 *              cari baris pasien tanpa peduli layout mana yang sedang
 *              aktif (`role=row` cuma ada di `<TableRow>`, tidak ada di
 *              card, jadi locator berbasis role saja tidak cukup).
 * @ui          shadcn/ui: Card, Table, Dialog, AlertDialog, Field, Input,
 *              Combobox, Button, Badge, Skeleton
 * @since       v1.0.0
 * ============================================================
 */

import { useState } from 'react'
import type { FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { useMasterDataList } from '@/features/master-data'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/ui/combobox'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { findComboboxOption } from '@/shared/utils/combobox'
import { usePasienList } from '../hooks/usePasienList'
import { useCreatePasien } from '../hooks/useCreatePasien'
import { useDeletePasien } from '../hooks/useDeletePasien'
import { useSetPasienStatus } from '../hooks/useSetPasienStatus'
import type { Pasien, PasienStatus } from '../types'
import { PasienVerificationDialog } from './PasienVerificationDialog'

const STATUS_LABEL: Record<PasienStatus, string> = {
  belum_verifikasi: 'Belum Verifikasi',
  aktif: 'Aktif',
  nonaktif: 'Nonaktif',
}

const STATUS_VARIANT: Record<PasienStatus, 'secondary' | 'default' | 'destructive'> = {
  belum_verifikasi: 'secondary',
  aktif: 'default',
  nonaktif: 'destructive',
}

interface FormErrors {
  nik?: string
  nama?: string
  tanggal_lahir?: string
  jenis_kelamin_id?: string
}

interface PasienActionsProps {
  pasien: Pasien
  onVerify: (pasien: Pasien) => void
  onDelete: (pasien: Pasien) => void
  onToggleStatus: (pasien: Pasien) => void
  toggleStatusPending: boolean
}

function PasienActions({ pasien, onVerify, onDelete, onToggleStatus, toggleStatusPending }: PasienActionsProps) {
  return (
    <>
      {pasien.status === 'belum_verifikasi' && (
        <Button variant="ghost" size="sm" onClick={() => onVerify(pasien)}>
          Verifikasi
        </Button>
      )}
      {pasien.status !== 'belum_verifikasi' && (
        <Button
          variant="ghost"
          size="sm"
          disabled={toggleStatusPending}
          onClick={() => onToggleStatus(pasien)}
        >
          {pasien.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={() => onDelete(pasien)}>
        Hapus
      </Button>
    </>
  )
}

export function PasienListPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = usePasienList(page)
  const { data: jenisKelaminList } = useMasterDataList('jenis-kelamin', 1, 100)
  const jenisKelaminItems = jenisKelaminList?.items.map((item) => ({ value: String(item.id), label: item.name })) ?? []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [nik, setNik] = useState('')
  const [nama, setNama] = useState('')
  const [tanggalLahir, setTanggalLahir] = useState('')
  const [jenisKelaminId, setJenisKelaminId] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const [deletingPasien, setDeletingPasien] = useState<Pasien | null>(null)
  const [verifyingPasien, setVerifyingPasien] = useState<Pasien | null>(null)
  const [verificationKey, setVerificationKey] = useState(0)

  function openVerifyDialog(pasienToVerify: Pasien) {
    setVerifyingPasien(pasienToVerify)
    setVerificationKey((key) => key + 1)
  }

  const create = useCreatePasien()
  const remove = useDeletePasien()
  const setStatus = useSetPasienStatus()

  function openCreateDialog() {
    setNik('')
    setNama('')
    setTanggalLahir('')
    setJenisKelaminId('')
    setErrors({})
    setDialogOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (!/^\d{16}$/.test(nik)) nextErrors.nik = 'NIK harus 16 digit angka.'
    if (!nama.trim()) nextErrors.nama = 'Nama wajib diisi.'
    if (!tanggalLahir) nextErrors.tanggal_lahir = 'Tanggal lahir wajib diisi.'
    if (!jenisKelaminId) nextErrors.jenis_kelamin_id = 'Jenis kelamin wajib dipilih.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    create
      .mutateAsync({
        nik,
        nama,
        tanggal_lahir: tanggalLahir,
        jenis_kelamin_id: Number(jenisKelaminId),
      })
      .then(() => setDialogOpen(false))
      .catch((error: unknown) => {
        if (isAxiosError(error)) {
          const apiErrors = error.response?.data?.errors as Record<string, string[]> | undefined
          setErrors({
            nik: apiErrors?.nik?.[0],
            nama: apiErrors?.nama?.[0],
            tanggal_lahir: apiErrors?.tanggal_lahir?.[0],
            jenis_kelamin_id: apiErrors?.jenis_kelamin_id?.[0],
          })
        }
      })
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Pasien</CardTitle>
        <Button onClick={openCreateDialog}>Tambah Pasien</Button>
      </CardHeader>
      <CardContent>
        {/* >= sm: tabel biasa. Di bawah sm, tabel 5 kolom (802px) tidak
            muat di layar HP (~375px) — overflow-x-auto teknisnya jalan
            tapi scroll horizontal di dalam card kecil begitu tersembunyi,
            kolom Status & Aksi (termasuk tombol Verifikasi/Hapus) jadi
            tidak kelihatan sama sekali tanpa geser dulu. Di bawah sm
            dipakai kartu bertumpuk (`PasienActions` dipakai bareng supaya
            logika tombol aksi tidak dobel). */}
        <div className="hidden overflow-x-auto xl:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>Tanggal Lahir</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-64 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center">
                    Belum ada data pasien.
                  </TableCell>
                </TableRow>
              )}

              {data?.items.map((pasien) => (
                <TableRow key={pasien.id} data-testid="pasien-row">
                  <TableCell className="break-words">{pasien.nama}</TableCell>
                  <TableCell className="whitespace-nowrap">{pasien.nik}</TableCell>
                  <TableCell className="whitespace-nowrap">{pasien.tanggal_lahir}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[pasien.status]}>
                      {STATUS_LABEL[pasien.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <PasienActions
                      pasien={pasien}
                      onVerify={openVerifyDialog}
                      onDelete={setDeletingPasien}
                      onToggleStatus={(p) => setStatus.mutate({ id: p.id, aktif: p.status !== 'aktif' })}
                      toggleStatusPending={setStatus.isPending}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 xl:hidden">
          {isLoading && <Skeleton className="h-24 w-full" />}

          {!isLoading && data?.items.length === 0 && (
            <p className="text-muted-foreground text-center text-sm">Belum ada data pasien.</p>
          )}

          {data?.items.map((pasien) => (
            <div key={pasien.id} data-testid="pasien-row" className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium break-words">{pasien.nama}</p>
                  <p className="text-muted-foreground text-sm">{pasien.nik}</p>
                </div>
                <Badge variant={STATUS_VARIANT[pasien.status]} className="shrink-0">
                  {STATUS_LABEL[pasien.status]}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">Tanggal Lahir: {pasien.tanggal_lahir}</p>
              <div className="flex flex-wrap items-center gap-1 border-t pt-2">
                <PasienActions
                  pasien={pasien}
                  onVerify={openVerifyDialog}
                  onDelete={setDeletingPasien}
                  onToggleStatus={(p) => setStatus.mutate({ id: p.id, aktif: p.status !== 'aktif' })}
                  toggleStatusPending={setStatus.isPending}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-muted-foreground text-sm">
            Halaman {data?.currentPage ?? 1} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader>
              <DialogTitle>Tambah Pasien</DialogTitle>
            </DialogHeader>

            <div className="my-4 flex flex-col gap-4">
              <Field data-invalid={Boolean(errors.nik)}>
                <FieldLabel htmlFor="pasien-nik">NIK</FieldLabel>
                <Input
                  id="pasien-nik"
                  inputMode="numeric"
                  maxLength={16}
                  aria-invalid={Boolean(errors.nik)}
                  value={nik}
                  onChange={(e) => {
                    setNik(e.target.value)
                    setErrors((prev) => ({ ...prev, nik: undefined }))
                  }}
                />
                {errors.nik && <FieldError>{errors.nik}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.nama)}>
                <FieldLabel htmlFor="pasien-nama">Nama</FieldLabel>
                <Input
                  id="pasien-nama"
                  aria-invalid={Boolean(errors.nama)}
                  value={nama}
                  onChange={(e) => {
                    setNama(e.target.value)
                    setErrors((prev) => ({ ...prev, nama: undefined }))
                  }}
                />
                {errors.nama && <FieldError>{errors.nama}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.tanggal_lahir)}>
                <FieldLabel htmlFor="pasien-tanggal-lahir">Tanggal Lahir</FieldLabel>
                <Input
                  id="pasien-tanggal-lahir"
                  type="date"
                  aria-invalid={Boolean(errors.tanggal_lahir)}
                  value={tanggalLahir}
                  onChange={(e) => {
                    setTanggalLahir(e.target.value)
                    setErrors((prev) => ({ ...prev, tanggal_lahir: undefined }))
                  }}
                />
                {errors.tanggal_lahir && <FieldError>{errors.tanggal_lahir}</FieldError>}
              </Field>

              <Field data-invalid={Boolean(errors.jenis_kelamin_id)}>
                <FieldLabel htmlFor="pasien-jenis-kelamin">Jenis Kelamin</FieldLabel>
                <Combobox
                  items={jenisKelaminItems}
                  value={findComboboxOption(jenisKelaminItems, jenisKelaminId)}
                  onValueChange={(item) => {
                    setJenisKelaminId(item?.value ?? '')
                    setErrors((prev) => ({ ...prev, jenis_kelamin_id: undefined }))
                  }}
                >
                  <ComboboxInput
                    id="pasien-jenis-kelamin"
                    placeholder="Cari jenis kelamin..."
                    aria-invalid={Boolean(errors.jenis_kelamin_id)}
                    className="w-full"
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: { value: string; label: string }) => (
                        <ComboboxItem key={item.value} value={item}>
                          {item.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {errors.jenis_kelamin_id && <FieldError>{errors.jenis_kelamin_id}</FieldError>}
              </Field>
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deletingPasien !== null}
        onOpenChange={(open) => !open && setDeletingPasien(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pasien?</AlertDialogTitle>
            <AlertDialogDescription>
              Data pasien &quot;{deletingPasien?.nama}&quot; akan dihapus. Tindakan ini tidak bisa
              dibatalkan lewat aplikasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingPasien) remove.mutate(deletingPasien.id)
                setDeletingPasien(null)
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PasienVerificationDialog
        key={verificationKey}
        pasien={verifyingPasien}
        open={verifyingPasien !== null}
        onOpenChange={(open) => !open && setVerifyingPasien(null)}
      />
    </Card>
  )
}
