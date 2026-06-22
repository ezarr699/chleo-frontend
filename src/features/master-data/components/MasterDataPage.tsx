/**
 * ============================================================
 * @module      master-data
 * @layer       component
 * @file        MasterDataPage.tsx
 * @path        src/features/master-data/components/MasterDataPage.tsx
 * @description Halaman CRUD generik untuk data master, dipakai oleh
 *              ke-5 jenis data master (Agama, Golongan Darah, dst) lewat
 *              prop `resource`/`label`. Tabel + paginasi sederhana
 *              (prev/next) untuk listing, Dialog untuk create/edit
 *              (validasi manual seperti LoginForm, tidak ada
 *              react-hook-form/zod di proyek ini), AlertDialog untuk
 *              konfirmasi hapus.
 * @ui          shadcn/ui: Card, Table, Dialog, Field, Input, Button,
 *              AlertDialog, Skeleton
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
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useMasterDataList } from '../hooks/useMasterDataList'
import { useCreateMasterData } from '../hooks/useCreateMasterData'
import { useUpdateMasterData } from '../hooks/useUpdateMasterData'
import { useDeleteMasterData } from '../hooks/useDeleteMasterData'
import type { MasterDataItem } from '../types'

interface MasterDataPageProps {
  resource: string
  label: string
}

export function MasterDataPage({ resource, label }: MasterDataPageProps) {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useMasterDataList(resource, page)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | undefined>()

  const [deletingItem, setDeletingItem] = useState<MasterDataItem | null>(null)

  const create = useCreateMasterData(resource)
  const update = useUpdateMasterData(resource)
  const remove = useDeleteMasterData(resource)

  function openCreateDialog() {
    setEditingItem(null)
    setName('')
    setNameError(undefined)
    setDialogOpen(true)
  }

  function openEditDialog(item: MasterDataItem) {
    setEditingItem(item)
    setName(item.name)
    setNameError(undefined)
    setDialogOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) {
      setNameError(`Nama ${label} wajib diisi.`)
      return
    }

    const mutation = editingItem
      ? update.mutateAsync({ id: editingItem.id, payload: { name } })
      : create.mutateAsync({ name })

    mutation
      .then(() => setDialogOpen(false))
      .catch((error: unknown) => {
        if (isAxiosError(error)) {
          const message = error.response?.data?.errors?.name?.[0] as string | undefined
          setNameError(message ?? 'Gagal menyimpan data.')
        }
      })
  }

  const isSaving = create.isPending || update.isPending
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>{label}</CardTitle>
        <Button onClick={openCreateDialog}>Tambah {label}</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="w-32 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={2}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-muted-foreground text-center">
                    Belum ada data {label}.
                  </TableCell>
                </TableRow>
              )}

              {data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="break-words">{item.name}</TableCell>
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
          <form onSubmit={handleSubmit} noValidate>
            <DialogHeader>
              <DialogTitle>{editingItem ? `Edit ${label}` : `Tambah ${label}`}</DialogTitle>
            </DialogHeader>

            <Field data-invalid={Boolean(nameError)} className="my-4">
              <FieldLabel htmlFor="master-data-name">Nama</FieldLabel>
              <Input
                id="master-data-name"
                aria-invalid={Boolean(nameError)}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (nameError) setNameError(undefined)
                }}
              />
              {nameError && <FieldError>{nameError}</FieldError>}
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
            <AlertDialogTitle>Hapus {label}?</AlertDialogTitle>
            <AlertDialogDescription>
              Data &quot;{deletingItem?.name}&quot; akan dihapus. Tindakan ini tidak bisa dibatalkan
              lewat aplikasi.
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
