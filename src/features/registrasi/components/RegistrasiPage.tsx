/**
 * ============================================================
 * @module      registrasi
 * @layer       component
 * @file        RegistrasiPage.tsx
 * @path        src/features/registrasi/components/RegistrasiPage.tsx
 * @description Halaman Pendaftaran: tabel kunjungan + Dialog "Daftar
 *              Kunjungan" dengan 3 Tab (Kunjungan Langsung/REG-01-1,
 *              Rujukan Masuk/REG-01-2, Booking/REG-01-3), aksi transisi
 *              status per baris (checkin/panggil/selesai/rujuk keluar/
 *              batal) sesuai alur RegistrasiService backend. Halaman ini
 *              dibuat seminimal mungkin — cukup untuk pengetesan manual
 *              seluruh endpoint modul Registrasi, bukan UI produksi
 *              final (tidak ada pencarian pasien server-side, dsb).
 * @ui          shadcn/ui: Card, Table, Dialog, Tabs, Combobox, Select,
 *              Field, Badge, Alert, Skeleton
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
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/ui/combobox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Badge } from '@/shared/components/ui/badge'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { findComboboxOption } from '@/shared/utils/combobox'
import { usePasienList } from '@/features/pasien'
import { useNakesList } from '@/features/nakes'
import { useMasterDataList } from '@/features/master-data'
import { useKunjunganList } from '../hooks/useKunjunganList'
import { useCreateKunjunganLangsung } from '../hooks/useCreateKunjunganLangsung'
import { useRujukanMasuk } from '../hooks/useRujukanMasuk'
import { useRujukanKeluar } from '../hooks/useRujukanKeluar'
import { useBooking } from '../hooks/useBooking'
import { useKunjunganTransisi } from '../hooks/useKunjunganTransisi'
import { useBatalKunjungan } from '../hooks/useBatalKunjungan'
import type { Kunjungan, KunjunganStatus } from '../types'

type TabPendaftaran = 'langsung' | 'rujukan_masuk' | 'booking'

const STATUS_LABEL: Record<KunjunganStatus, string> = {
  terjadwal: 'Terjadwal',
  menunggu: 'Menunggu',
  dipanggil: 'Dipanggil',
  selesai: 'Selesai',
  batal: 'Batal',
  dirujuk: 'Dirujuk',
}

const STATUS_VARIANT: Record<KunjunganStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  terjadwal: 'secondary',
  menunggu: 'secondary',
  dipanggil: 'default',
  selesai: 'outline',
  batal: 'destructive',
  dirujuk: 'outline',
}

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data
    const firstFieldError = data?.errors ? Object.values(data.errors)[0] as string[] | undefined : undefined
    return firstFieldError?.[0] ?? data?.message ?? 'Terjadi kesalahan, coba lagi.'
  }
  return 'Terjadi kesalahan, coba lagi.'
}

export function RegistrasiPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useKunjunganList(page)

  const { data: pasienData } = usePasienList(1, 100)
  const { data: poliklinikData } = useMasterDataList('poliklinik', 1, 100)
  const { data: penjaminData } = useMasterDataList('penjamin', 1, 100)
  const { data: nakesData } = useNakesList(1, 100)

  const pasienItems = pasienData?.items.map((p) => ({ value: String(p.id), label: `${p.nama} (${p.nik})` })) ?? []
  const poliklinikItems = poliklinikData?.items.map((p) => ({ value: String(p.id), label: p.name })) ?? []
  const penjaminItems = penjaminData?.items.map((p) => ({ value: String(p.id), label: p.name })) ?? []
  const nakesItems = nakesData?.items.map((n) => ({ value: String(n.id), label: `${n.user.name} (${n.profesi.name})` })) ?? []

  // --- Dialog "Daftar Kunjungan" (create, 3 tab) ---
  const [dialogOpen, setDialogOpen] = useState(false)
  const [tab, setTab] = useState<TabPendaftaran>('langsung')
  const [formError, setFormError] = useState<string | null>(null)

  const [pasienId, setPasienId] = useState('')
  const [poliklinikId, setPoliklinikId] = useState('')
  const [nakesId, setNakesId] = useState('')
  const [penjaminId, setPenjaminId] = useState('')
  const [tanggalKunjungan, setTanggalKunjungan] = useState('')
  const [jamPraktek, setJamPraktek] = useState('')
  const [catatan, setCatatan] = useState('')

  const [asalFaskesKode, setAsalFaskesKode] = useState('')
  const [asalFaskesNama, setAsalFaskesNama] = useState('')
  const [nomorRujukanSisrute, setNomorRujukanSisrute] = useState('')
  const [nomorRujukanBpjs, setNomorRujukanBpjs] = useState('')
  const [diagnosaRujukan, setDiagnosaRujukan] = useState('')

  const [sumberBooking, setSumberBooking] = useState<'web_portal' | 'mobile_jkn' | ''>('')

  const createLangsung = useCreateKunjunganLangsung()
  const rujukanMasuk = useRujukanMasuk()
  const booking = useBooking()

  function resetForm() {
    setTab('langsung')
    setFormError(null)
    setPasienId('')
    setPoliklinikId('')
    setNakesId('')
    setPenjaminId('')
    setTanggalKunjungan('')
    setJamPraktek('')
    setCatatan('')
    setAsalFaskesKode('')
    setAsalFaskesNama('')
    setNomorRujukanSisrute('')
    setNomorRujukanBpjs('')
    setDiagnosaRujukan('')
    setSumberBooking('')
  }

  function openCreateDialog() {
    resetForm()
    setDialogOpen(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (!pasienId || !poliklinikId || !penjaminId) {
      setFormError('Pasien, poliklinik, dan penjamin wajib dipilih.')
      return
    }

    const base = {
      pasien_id: Number(pasienId),
      poliklinik_id: Number(poliklinikId),
      profil_nakes_id: nakesId ? Number(nakesId) : null,
      penjamin_id: Number(penjaminId),
      jam_praktek: jamPraktek || undefined,
      catatan: catatan || undefined,
    }

    let mutation: Promise<Kunjungan>

    if (tab === 'langsung') {
      mutation = createLangsung.mutateAsync({ ...base, tanggal_kunjungan: tanggalKunjungan || undefined })
    } else if (tab === 'rujukan_masuk') {
      if (!asalFaskesKode || !asalFaskesNama) {
        setFormError('Kode dan nama faskes asal wajib diisi.')
        return
      }
      mutation = rujukanMasuk.mutateAsync({
        ...base,
        tanggal_kunjungan: tanggalKunjungan || undefined,
        asal_faskes_kode: asalFaskesKode,
        asal_faskes_nama: asalFaskesNama,
        nomor_rujukan_sisrute: nomorRujukanSisrute || undefined,
        nomor_rujukan_bpjs: nomorRujukanBpjs || undefined,
        diagnosa_rujukan: diagnosaRujukan || undefined,
      })
    } else {
      if (!tanggalKunjungan || !sumberBooking) {
        setFormError('Tanggal kunjungan dan sumber booking wajib diisi.')
        return
      }
      mutation = booking.mutateAsync({
        ...base,
        tanggal_kunjungan: tanggalKunjungan,
        sumber_booking: sumberBooking,
      })
    }

    mutation
      .then(() => setDialogOpen(false))
      .catch((error: unknown) => setFormError(extractErrorMessage(error)))
  }

  const isSaving = createLangsung.isPending || rujukanMasuk.isPending || booking.isPending

  // --- Dialog "Rujuk Keluar" ---
  const [rujukKeluarTarget, setRujukKeluarTarget] = useState<Kunjungan | null>(null)
  const [tujuanFaskesKode, setTujuanFaskesKode] = useState('')
  const [tujuanFaskesNama, setTujuanFaskesNama] = useState('')
  const [rujukKeluarError, setRujukKeluarError] = useState<string | null>(null)
  const rujukKeluar = useRujukanKeluar()

  function openRujukKeluarDialog(item: Kunjungan) {
    setRujukKeluarTarget(item)
    setTujuanFaskesKode('')
    setTujuanFaskesNama('')
    setRujukKeluarError(null)
  }

  function handleRujukKeluarSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!rujukKeluarTarget) return
    if (!tujuanFaskesKode || !tujuanFaskesNama) {
      setRujukKeluarError('Kode dan nama faskes tujuan wajib diisi.')
      return
    }

    rujukKeluar
      .mutateAsync({
        id: rujukKeluarTarget.id,
        payload: { tujuan_faskes_kode: tujuanFaskesKode, tujuan_faskes_nama: tujuanFaskesNama },
      })
      .then(() => setRujukKeluarTarget(null))
      .catch((error: unknown) => setRujukKeluarError(extractErrorMessage(error)))
  }

  // --- Dialog "Batal" ---
  const [batalTarget, setBatalTarget] = useState<Kunjungan | null>(null)
  const [alasanBatal, setAlasanBatal] = useState('')
  const [batalError, setBatalError] = useState<string | null>(null)
  const batal = useBatalKunjungan()

  function openBatalDialog(item: Kunjungan) {
    setBatalTarget(item)
    setAlasanBatal('')
    setBatalError(null)
  }

  function handleBatalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!batalTarget) return
    if (!alasanBatal) {
      setBatalError('Alasan batal wajib diisi.')
      return
    }

    batal
      .mutateAsync({ id: batalTarget.id, alasan: alasanBatal })
      .then(() => setBatalTarget(null))
      .catch((error: unknown) => setBatalError(extractErrorMessage(error)))
  }

  // --- Transisi status (checkin/panggil/selesai) ---
  const transisi = useKunjunganTransisi()

  function renderAksi(item: Kunjungan) {
    const busy = transisi.isPending || rujukKeluar.isPending || batal.isPending

    const tombolBatal = (
      <Button key="batal" variant="ghost" size="sm" disabled={busy} onClick={() => openBatalDialog(item)}>
        Batal
      </Button>
    )
    const tombolRujukKeluar = (
      <Button key="rujuk" variant="ghost" size="sm" disabled={busy} onClick={() => openRujukKeluarDialog(item)}>
        Rujuk Keluar
      </Button>
    )

    if (item.status === 'terjadwal') {
      return (
        <>
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => transisi.mutate({ id: item.id, aksi: 'checkin' })}
          >
            Check-in
          </Button>
          {tombolBatal}
        </>
      )
    }

    if (item.status === 'menunggu') {
      return (
        <>
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => transisi.mutate({ id: item.id, aksi: 'panggil' })}
          >
            Panggil
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => transisi.mutate({ id: item.id, aksi: 'selesai' })}
          >
            Selesai
          </Button>
          {tombolRujukKeluar}
          {tombolBatal}
        </>
      )
    }

    if (item.status === 'dipanggil') {
      return (
        <>
          <Button
            variant="ghost"
            size="sm"
            disabled={busy}
            onClick={() => transisi.mutate({ id: item.id, aksi: 'selesai' })}
          >
            Selesai
          </Button>
          {tombolRujukKeluar}
          {tombolBatal}
        </>
      )
    }

    return <span className="text-muted-foreground text-xs">-</span>
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Pendaftaran</CardTitle>
        <Button onClick={openCreateDialog}>Daftar Kunjungan</Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Registrasi</TableHead>
                <TableHead>Pasien</TableHead>
                <TableHead>Poliklinik</TableHead>
                <TableHead>Cara Masuk</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground text-center">
                    Belum ada kunjungan.
                  </TableCell>
                </TableRow>
              )}

              {data?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">{item.no_registrasi ?? '-'}</TableCell>
                  <TableCell className="break-words">{item.pasien?.nama ?? '-'}</TableCell>
                  <TableCell className="break-words">{item.poliklinik?.name ?? '-'}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.cara_masuk}</TableCell>
                  <TableCell className="whitespace-nowrap">{item.tanggal_kunjungan ?? '-'}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[item.status]}>{STATUS_LABEL[item.status]}</Badge>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">{renderAksi(item)}</TableCell>
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
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Sebelumnya
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Selanjutnya
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Dialog: Daftar Kunjungan (Kunjungan Langsung / Rujukan Masuk / Booking) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Daftar Kunjungan</DialogTitle>
            </DialogHeader>

            <Tabs value={tab} onValueChange={(value) => setTab(value as TabPendaftaran)}>
              <TabsList className="w-full">
                <TabsTrigger value="langsung">Kunjungan Langsung</TabsTrigger>
                <TabsTrigger value="rujukan_masuk">Rujukan Masuk</TabsTrigger>
                <TabsTrigger value="booking">Booking</TabsTrigger>
              </TabsList>
            </Tabs>

            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel htmlFor="reg-pasien">Pasien</FieldLabel>
              <Combobox
                items={pasienItems}
                value={findComboboxOption(pasienItems, pasienId)}
                onValueChange={(item) => setPasienId(item?.value ?? '')}
              >
                <ComboboxInput id="reg-pasien" placeholder="Cari pasien..." />
                <ComboboxContent>
                  <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {pasienItems.map((item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            <Field>
              <FieldLabel htmlFor="reg-poliklinik">Poliklinik</FieldLabel>
              <Combobox
                items={poliklinikItems}
                value={findComboboxOption(poliklinikItems, poliklinikId)}
                onValueChange={(item) => setPoliklinikId(item?.value ?? '')}
              >
                <ComboboxInput id="reg-poliklinik" placeholder="Cari poliklinik..." />
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
              <FieldLabel htmlFor="reg-nakes">Nakes (opsional)</FieldLabel>
              <Combobox
                items={nakesItems}
                value={findComboboxOption(nakesItems, nakesId)}
                onValueChange={(item) => setNakesId(item?.value ?? '')}
              >
                <ComboboxInput id="reg-nakes" placeholder="Cari nakes..." />
                <ComboboxContent>
                  <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {nakesItems.map((item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            <Field>
              <FieldLabel htmlFor="reg-penjamin">Penjamin</FieldLabel>
              <Combobox
                items={penjaminItems}
                value={findComboboxOption(penjaminItems, penjaminId)}
                onValueChange={(item) => setPenjaminId(item?.value ?? '')}
              >
                <ComboboxInput id="reg-penjamin" placeholder="Cari penjamin..." />
                <ComboboxContent>
                  <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                  <ComboboxList>
                    {penjaminItems.map((item) => (
                      <ComboboxItem key={item.value} value={item}>
                        {item.label}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>

            <Field>
              <FieldLabel htmlFor="reg-tanggal">
                Tanggal Kunjungan {tab === 'booking' ? '' : '(opsional, default hari ini)'}
              </FieldLabel>
              <Input
                id="reg-tanggal"
                type="date"
                value={tanggalKunjungan}
                onChange={(e) => setTanggalKunjungan(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="reg-jam">Jam Praktek (opsional)</FieldLabel>
              <Input id="reg-jam" placeholder="08:00-12:00" value={jamPraktek} onChange={(e) => setJamPraktek(e.target.value)} />
            </Field>

            {tab === 'rujukan_masuk' && (
              <>
                <Field>
                  <FieldLabel htmlFor="reg-asal-kode">Kode Faskes Asal</FieldLabel>
                  <Input id="reg-asal-kode" value={asalFaskesKode} onChange={(e) => setAsalFaskesKode(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="reg-asal-nama">Nama Faskes Asal</FieldLabel>
                  <Input id="reg-asal-nama" value={asalFaskesNama} onChange={(e) => setAsalFaskesNama(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="reg-no-sisrute">No. Rujukan SISRUTE (opsional)</FieldLabel>
                  <Input id="reg-no-sisrute" value={nomorRujukanSisrute} onChange={(e) => setNomorRujukanSisrute(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="reg-no-bpjs">No. Rujukan BPJS (opsional)</FieldLabel>
                  <Input id="reg-no-bpjs" value={nomorRujukanBpjs} onChange={(e) => setNomorRujukanBpjs(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="reg-diagnosa-rujukan">Diagnosa Rujukan (opsional)</FieldLabel>
                  <Input id="reg-diagnosa-rujukan" value={diagnosaRujukan} onChange={(e) => setDiagnosaRujukan(e.target.value)} />
                </Field>
              </>
            )}

            {tab === 'booking' && (
              <Field>
                <FieldLabel htmlFor="reg-sumber-booking">Sumber Booking</FieldLabel>
                <Select value={sumberBooking} onValueChange={(value) => setSumberBooking(value as typeof sumberBooking)}>
                  <SelectTrigger id="reg-sumber-booking" className="w-full">
                    <SelectValue placeholder="Pilih sumber booking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web_portal">Web Portal</SelectItem>
                    <SelectItem value="mobile_jkn">Mobile JKN</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="reg-catatan">Catatan (opsional)</FieldLabel>
              <Textarea id="reg-catatan" value={catatan} onChange={(e) => setCatatan(e.target.value)} />
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

      {/* Dialog: Rujuk Keluar */}
      <Dialog open={rujukKeluarTarget !== null} onOpenChange={(open) => !open && setRujukKeluarTarget(null)}>
        <DialogContent>
          <form onSubmit={handleRujukKeluarSubmit} noValidate className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Rujuk Keluar — {rujukKeluarTarget?.pasien?.nama}</DialogTitle>
            </DialogHeader>

            {rujukKeluarError && (
              <Alert variant="destructive">
                <AlertDescription>{rujukKeluarError}</AlertDescription>
              </Alert>
            )}

            <Field>
              <FieldLabel htmlFor="rk-kode">Kode Faskes Tujuan</FieldLabel>
              <Input id="rk-kode" value={tujuanFaskesKode} onChange={(e) => setTujuanFaskesKode(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="rk-nama">Nama Faskes Tujuan</FieldLabel>
              <Input id="rk-nama" value={tujuanFaskesNama} onChange={(e) => setTujuanFaskesNama(e.target.value)} />
            </Field>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setRujukKeluarTarget(null)}>
                Tutup
              </Button>
              <Button type="submit" disabled={rujukKeluar.isPending}>
                {rujukKeluar.isPending ? 'Menyimpan...' : 'Rujuk Keluar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Batal */}
      <Dialog open={batalTarget !== null} onOpenChange={(open) => !open && setBatalTarget(null)}>
        <DialogContent>
          <form onSubmit={handleBatalSubmit} noValidate className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>Batalkan Kunjungan — {batalTarget?.pasien?.nama}</DialogTitle>
            </DialogHeader>

            {batalError && (
              <Alert variant="destructive">
                <AlertDescription>{batalError}</AlertDescription>
              </Alert>
            )}

            <Field data-invalid={Boolean(batalError)}>
              <FieldLabel htmlFor="batal-alasan">Alasan Batal</FieldLabel>
              <Textarea id="batal-alasan" value={alasanBatal} onChange={(e) => setAlasanBatal(e.target.value)} />
              {batalError && <FieldError>{batalError}</FieldError>}
            </Field>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setBatalTarget(null)}>
                Tutup
              </Button>
              <Button type="submit" variant="destructive" disabled={batal.isPending}>
                {batal.isPending ? 'Menyimpan...' : 'Batalkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
