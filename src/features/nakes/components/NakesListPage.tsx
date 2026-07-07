/**
 * ============================================================
 * @module      nakes
 * @layer       component
 * @file        NakesListPage.tsx
 * @path        src/features/nakes/components/NakesListPage.tsx
 * @description Halaman daftar Profil Nakes: tabel + Dialog "Tambah Profil
 *              Nakes" dengan 3 Combobox (User, Profesi, Poliklinik — pola
 *              sama dengan Combobox Jenis Kelamin di PasienListPage) plus
 *              field No. SIP, No. STR, dan tanggal berlaku STR. Poliklinik
 *              opsional (perawat/apoteker/admin tidak wajib punya poli).
 * @ui          shadcn/ui: Card, Table, Dialog, AlertDialog, Field, Input,
 *              Combobox, Button, Skeleton
 * @since       v1.0.0
 * ============================================================
 */

import { useState } from 'react'
import type { FormEvent } from 'react'
import { isAxiosError } from 'axios'
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
import { useMasterDataList } from '@/features/master-data'
import { useNakesList } from '../hooks/useNakesList'
import { useCreateNakes } from '../hooks/useCreateNakes'
import { useUpdateNakes } from '../hooks/useUpdateNakes'
import { useDeleteNakes } from '../hooks/useDeleteNakes'
import { useUserDirectory } from '../hooks/useUserDirectory'
import type { ProfilNakes } from '../types'

interface FormErrors {
  user_id?: string
  profesi_id?: string
}

export function NakesListPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useNakesList(page)
  const { data: users } = useUserDirectory()
  const { data: profesiList } = useMasterDataList('profesi', 1, 100)
  const { data: poliklinikList } = useMasterDataList('poliklinik', 1, 100)

  const userItems = users?.map((u) => ({ value: String(u.id), label: `${u.name} (${u.email})` })) ?? []
  const profesiItems = profesiList?.items.map((item) => ({ value: String(item.id), label: item.name })) ?? []
  const poliklinikItems = poliklinikList?.items.map((item) => ({ value: String(item.id), label: item.name })) ?? []

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ProfilNakes | null>(null)
  const [userId, setUserId] = useState('')
  const [profesiId, setProfesiId] = useState('')
  const [poliklinikId, setPoliklinikId] = useState('')
  const [noSip, setNoSip] = useState('')
  const [noStr, setNoStr] = useState('')
  const [strBerlakuSampai, setStrBerlakuSampai] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const [deletingItem, setDeletingItem] = useState<ProfilNakes | null>(null)

  const create = useCreateNakes()
  const update = useUpdateNakes()
  const remove = useDeleteNakes()

  function openCreateDialog() {
    setEditingItem(null)
    setUserId('')
    setProfesiId('')
    setPoliklinikId('')
    setNoSip('')
    setNoStr('')
    setStrBerlakuSampai('')
    setErrors({})
    setDialogOpen(true)
  }

  function openEditDialog(item: ProfilNakes) {
    setEditingItem(item)
    setUserId(String(item.user.id))
    setProfesiId(String(item.profesi.id))
    setPoliklinikId(item.poliklinik ? String(item.poliklinik.id) : '')
    setNoSip(item.no_sip ?? '')
    setNoStr(item.no_str ?? '')
    setStrBerlakuSampai(item.str_berlaku_sampai ?? '')
    setErrors({})
    setDialogOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    if (!userId) nextErrors.user_id = 'User wajib dipilih.'
    if (!profesiId) nextErrors.profesi_id = 'Profesi wajib dipilih.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const payload = {
      user_id: Number(userId),
      profesi_id: Number(profesiId),
      poliklinik_id: poliklinikId ? Number(poliklinikId) : null,
      no_sip: noSip || null,
      no_str: noStr || null,
      str_berlaku_sampai: strBerlakuSampai || null,
    }

    const mutation = editingItem
      ? update.mutateAsync({ id: editingItem.id, payload })
      : create.mutateAsync(payload)

    mutation
      .then(() => setDialogOpen(false))
      .catch((error: unknown) => {
        if (isAxiosError(error)) {
          const apiErrors = error.response?.data?.errors
          setErrors({
            user_id: apiErrors?.user_id?.[0],
            profesi_id: apiErrors?.profesi_id?.[0],
          })
        }
      })
  }

  const isSaving = create.isPending || update.isPending
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Profil Nakes</CardTitle>
        <Button onClick={openCreateDialog}>Tambah Profil Nakes</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Profesi</TableHead>
                <TableHead>Poliklinik</TableHead>
                <TableHead>No. SIP</TableHead>
                <TableHead>No. STR</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground text-center">
                    Belum ada data Profil Nakes.
                  </TableCell>
                </TableRow>
              )}

              {data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="break-words">
                    {item.user.name}
                    <span className="text-muted-foreground block text-xs">{item.user.email}</span>
                  </TableCell>
                  <TableCell className="break-words">{item.profesi.name}</TableCell>
                  <TableCell className="break-words">{item.poliklinik?.name ?? '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.no_sip ?? '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.no_str ?? '-'}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeletingItem(item)}>
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Profil Nakes' : 'Tambah Profil Nakes'}</DialogTitle>
            </DialogHeader>

            <Field data-invalid={Boolean(errors.user_id)}>
              <FieldLabel htmlFor="nakes-user">User</FieldLabel>
              <Combobox
                items={userItems}
                value={findComboboxOption(userItems, userId)}
                onValueChange={(item) => {
                  setUserId(item?.value ?? '')
                  setErrors((prev) => ({ ...prev, user_id: undefined }))
                }}
              >
                <ComboboxInput id="nakes-user" placeholder="Cari user..." aria-invalid={Boolean(errors.user_id)} />
                <ComboboxContent>
                  <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {userItems.map((item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {errors.user_id && <FieldError>{errors.user_id}</FieldError>}
            </Field>

            <Field data-invalid={Boolean(errors.profesi_id)}>
              <FieldLabel htmlFor="nakes-profesi">Profesi</FieldLabel>
              <Combobox
                items={profesiItems}
                value={findComboboxOption(profesiItems, profesiId)}
                onValueChange={(item) => {
                  setProfesiId(item?.value ?? '')
                  setErrors((prev) => ({ ...prev, profesi_id: undefined }))
                }}
              >
                <ComboboxInput id="nakes-profesi" placeholder="Cari profesi..." aria-invalid={Boolean(errors.profesi_id)} />
                <ComboboxContent>
                  <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {profesiItems.map((item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {errors.profesi_id && <FieldError>{errors.profesi_id}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="nakes-poliklinik">Poliklinik (opsional)</FieldLabel>
              <Combobox
                items={poliklinikItems}
                value={findComboboxOption(poliklinikItems, poliklinikId)}
                onValueChange={(item) => setPoliklinikId(item?.value ?? '')}
              >
                <ComboboxInput id="nakes-poliklinik" placeholder="Cari poliklinik..." />
                <ComboboxContent>
                  <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {poliklinikItems.map((item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            <Field>
              <FieldLabel htmlFor="nakes-no-sip">No. SIP</FieldLabel>
              <Input id="nakes-no-sip" value={noSip} onChange={(e) => setNoSip(e.target.value)} />
            </Field>

            <Field>
              <FieldLabel htmlFor="nakes-no-str">No. STR</FieldLabel>
              <Input id="nakes-no-str" value={noStr} onChange={(e) => setNoStr(e.target.value)} />
            </Field>

            <Field>
              <FieldLabel htmlFor="nakes-str-berlaku">STR Berlaku Sampai</FieldLabel>
              <Input
                id="nakes-str-berlaku"
                type="date"
                value={strBerlakuSampai}
                onChange={(e) => setStrBerlakuSampai(e.target.value)}
              />
            </Field>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletingItem !== null} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Profil Nakes?</AlertDialogTitle>
            <AlertDialogDescription>
              Profil nakes untuk &quot;{deletingItem?.user.name}&quot; akan dihapus. Tindakan ini
              tidak bisa dibatalkan lewat aplikasi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingItem) remove.mutate(deletingItem.id)
                setDeletingItem(null)
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
