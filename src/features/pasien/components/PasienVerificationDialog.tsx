/**
 * ============================================================
 * @module      pasien
 * @layer       component
 * @file        PasienVerificationDialog.tsx
 * @path        src/features/pasien/components/PasienVerificationDialog.tsx
 * @description Dialog wizard 3 langkah untuk verifikasi pasien (dipicu
 *              dari tombol "Verifikasi" di PasienListPage, bukan halaman
 *              tersendiri):
 *              1) Data Lengkap (wajib — foto, tempat lahir, golongan
 *              darah, telepon, alamat), 2) Informasi BPJS (opsional,
 *              boleh dilewati, tetap 1 entri karena BPJS hanya satu per
 *              orang), 3) Informasi Asuransi Tambahan (opsional, boleh
 *              dilewati, BISA LEBIH DARI SATU entri — asuransi swasta
 *              tambahan wajar lebih dari satu per pasien, lihat
 *              `asuransiEntries`). Step indicator custom (lingkaran
 *              bernomor + garis penghubung — shadcn tidak punya komponen
 *              Stepper bawaan); langkah lanjutan terkunci sampai langkah
 *              wajib selesai divalidasi. Konten step diberi `min-h` yang
 *              sama supaya tinggi dialog tidak "melompat" antar step.
 *              `DialogContent` sendiri dibatasi `max-h-[90vh]` + `flex
 *              flex-col` (header/stepper/footer `shrink-0`, area konten
 *              `flex-1 overflow-y-auto`) — tanpa ini dialog bisa lebih
 *              tinggi dari viewport dan sudut rounded-nya terpotong tepi
 *              browser saat konten panjang (mis. banyak entri asuransi).
 *              Upload foto disembunyikan secara visual (`input[type=file]`
 *              `sr-only`), dipicu langsung lewat Avatar (size-45, custom
 *              besar) yang dibungkus `<button>` — TIDAK ada tombol
 *              "Pilih/Ganti Foto" terpisah lagi, avatar sendiri sudah jadi
 *              satu-satunya & cukup jelas jadi target klik (overlay hover
 *              gelap + ikon upload sebagai affordance visual). Label
 *              `sr-only` di `<label>` diperjelas ("Foto — klik untuk
 *              mengunggah") supaya screen reader tetap dapat konteks yang
 *              sebelumnya disampaikan lewat teks tombol. SENGAJA TIDAK
 *              pakai prop `size="lg"` pada `Avatar` — `data-[size=lg]:size-10`
 *              bawaan komponen (selector attribute, spesifisitas lebih
 *              tinggi dari class biasa) selalu menang atas `size-*` custom
 *              apa pun yang ditambah lewat `className`, jadi avatar
 *              keliatan macet di 40px walau class-nya sudah diperbesar.
 *              Tanpa prop `size`, Avatar jatuh ke data-size="default"
 *              (tidak match rule manapun) dan `size-45` di className
 *              berlaku normal.
 *              SEMUA dropdown di dialog ini (Golongan Darah, Tempat Lahir,
 *              Provinsi/Kabupaten/Kecamatan/Kelurahan, Asuransi) pakai
 *              `Combobox` (base-ui, `src/shared/components/ui/combobox.tsx`)
 *              dengan filter pencarian bawaan — BUKAN `Select` biasa lagi,
 *              lihat catatan Tempat Lahir di bawah untuk alasannya. Tiap
 *              satu diberi `items` berupa array `{value, label}` (helper
 *              `mergeWilayahItems`/`findComboboxOption`) karena `value`
 *              Combobox adalah OBJEK item, bukan string id/code polos —
 *              butuh lookup `findComboboxOption(items, currentCode)` untuk
 *              dapat objek yang match sebagai `value` terkontrol, dan
 *              `onValueChange` mengembalikan objek itu juga (`item?.value`
 *              untuk ambil id/code-nya balik).
 *              State form selalu mulai bersih karena PasienListPage me-remount
 *              komponen ini lewat `key` setiap kali tombol "Verifikasi"
 *              diklik — bukan reset lewat useEffect (menghindari
 *              react-hooks/set-state-in-effect & potensi render ganda).
 *              Deteksi lokasi (Geolocation + reverse-geocode backend)
 *              otomatis dipicu saat dialog terbuka (klik "Verifikasi" di
 *              PasienListPage) — tidak ada tombol manual, status
 *              pending/error/hasil ditampilkan sebagai teks kecil di
 *              bawah field Nomor Telepon. Gagal/sebagian cocok tidak
 *              memblokir apa pun, pengguna tetap bisa pilih manual. Hasil
 *              deteksi (`deteksiResult`) disimpan & di-merge ke `items`
 *              tiap Combobox wilayah (`mergeWilayahItems`) supaya label
 *              langsung tampil benar saat itu juga — tanpa ini, kode yang
 *              baru di-set oleh tombol lokasi sempat tampil sebagai angka
 *              mentah selama sepersekian detik sebelum query daftar
 *              berjenjang (yang baru aktif setelah kode induknya terisi)
 *              selesai fetch dan baru bisa menerjemahkannya ke nama.
 *              Kolom kiri step Data Lengkap dilebarkan ke
 *              `sm:grid-cols-[320px_1fr]` (dari 200px) supaya Tempat Lahir
 *              & Tanggal Lahir muat sejajar 1 baris (`grid-cols-2`) di
 *              bawah Foto — Foto sendiri tetap di posisi/baris semula
 *              (atas, center), tidak ikut disejajarkan. Border kanan
 *              (`sm:border-r`) di kolom kiri sengaja dipertahankan supaya
 *              perbedaan tinggi dengan kolom kanan (Informasi Tambahan,
 *              lebih panjang) terlihat seperti pola sidebar yang disengaja.
 *              Tanggal Lahir ditampilkan `readOnly` (teks polos, BUKAN
 *              `type="date"` — biar gaya tampilannya menyatu dengan Tempat
 *              Lahir, bukan kalender bawaan browser) karena nilainya
 *              berasal dari `pasien.tanggal_lahir` yang diisi saat "Tambah
 *              Pasien", bukan bagian dari payload verifikasi — endpoint
 *              verifikasi (`VerifyPasienRequest`) tidak menerima field ini.
 *              Pilih file foto TIDAK langsung dipakai — `handleFotoChange`
 *              cuma membuka `FotoCropDialog` (dialog terpisah, di-render
 *              sebagai sibling `<Dialog>` ini lewat Fragment, BUKAN nested
 *              di dalam `DialogContent`, supaya scope Dialog.Root
 *              base-ui-nya tidak bertumpuk) via state `cropSource`. Hasil
 *              crop (`handleCropped`) barulah yang di-set ke `foto`/
 *              `fotoPreview` dan dikirim ke backend — lihat
 *              `./FotoCropDialog.tsx` untuk detail crop-nya.
 *              Tempat Lahir isinya kabupaten/kota se-Indonesia
 *              (`useKabupatenNasionalList`, ~514 baris, TIDAK berjenjang
 *              dari Provinsi — independen dari dropdown alamat di bawahnya
 *              karena kota lahir pasien wajar beda dari alamat domisili
 *              saat ini). `Select` polos sempat dipakai duluan tapi 514
 *              `<SelectItem>` sekaligus bikin popup-nya kepotong/susah
 *              dicari — makanya SEMUA dropdown akhirnya diseragamkan jadi
 *              `Combobox` (bukan cuma Tempat Lahir), dengan `limit={50}`
 *              khusus di sini supaya render list 514 barisnya ringan.
 *              State `tempatLahirCode` tetap menyimpan CODE kabupaten;
 *              saat submit, code itu diterjemahkan ke NAME
 *              (`tempatLahirNama` di `handleSubmit`) karena field backend
 *              `tempat_lahir` masih string bebas (`max:255`), bukan
 *              foreign key ke tabel kabupaten.
 * @ui          shadcn/ui: Dialog, Avatar, Badge, Field, Input, Textarea,
 *              Combobox, Button, Alert, Separator
 * @since       v1.0.0
 * ============================================================
 */

import { Fragment, useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { isAxiosError } from 'axios'
import { CheckIcon, ImageUpIcon, PlusIcon, UserRoundIcon, XIcon } from 'lucide-react'
import { useMasterDataList } from '@/features/master-data'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/shared/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Separator } from '@/shared/components/ui/separator'
import { Textarea } from '@/shared/components/ui/textarea'
import { findComboboxOption } from '@/shared/utils/combobox'
import type { ComboboxOption } from '@/shared/utils/combobox'
import { cn } from '@/shared/utils/utils'
import { FotoCropDialog } from './FotoCropDialog'
import { useDeteksiLokasi } from '../hooks/useDeteksiLokasi'
import { useVerifyPasien } from '../hooks/useVerifyPasien'
import {
  useKabupatenList,
  useKabupatenNasionalList,
  useKecamatanList,
  useKelurahanList,
  useProvinsiList,
} from '../hooks/useWilayah'
import type { DeteksiLokasiResult } from '../services/wilayahService'
import type { Pasien, WilayahRef } from '../types'

const STEPS = ['data-lengkap', 'bpjs', 'asuransi'] as const
type Step = (typeof STEPS)[number]

const STEP_META: Record<Step, { label: string; description: string }> = {
  'data-lengkap': { label: 'Data Lengkap', description: 'Wajib diisi' },
  bpjs: { label: 'BPJS', description: 'Opsional' },
  asuransi: { label: 'Asuransi Tambahan', description: 'Opsional' },
}

interface StepErrors {
  foto?: string
  tempat_lahir?: string
  golongan_darah_id?: string
  nomor_telepon?: string
  alamat?: string
}

interface AsuransiEntry {
  tempId: string
  asuransiId: string
  nomorPolis: string
  masaBerlaku: string
}

function createEmptyAsuransiEntry(): AsuransiEntry {
  return { tempId: crypto.randomUUID(), asuransiId: '', nomorPolis: '', masaBerlaku: '' }
}

function mergeWilayahItems(list: WilayahRef[] | undefined, extra: WilayahRef | null | undefined) {
  const items = (list ?? []).map((item) => ({ value: item.code, label: item.name }))
  if (extra && !items.some((item) => item.value === extra.code)) {
    items.push({ value: extra.code, label: extra.name })
  }

  return items
}

interface PasienVerificationDialogProps {
  pasien: Pasien | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PasienVerificationDialog({ pasien, open, onOpenChange }: PasienVerificationDialogProps) {
  const fotoInputRef = useRef<HTMLInputElement>(null)

  const { data: golonganDarahList } = useMasterDataList('golongan-darah', 1, 100)
  const golonganDarahItems: ComboboxOption[] =
    golonganDarahList?.items.map((item) => ({ value: String(item.id), label: item.name })) ?? []
  const { data: asuransiList } = useMasterDataList('asuransi', 1, 100)
  const asuransiSelectItems: ComboboxOption[] =
    asuransiList?.items.map((item) => ({ value: String(item.id), label: item.name })) ?? []
  const verify = useVerifyPasien()

  const [provinsiCode, setProvinsiCode] = useState('')
  const [kabupatenCode, setKabupatenCode] = useState('')
  const [kecamatanCode, setKecamatanCode] = useState('')
  const [kelurahanCode, setKelurahanCode] = useState('')
  const [deteksiResult, setDeteksiResult] = useState<DeteksiLokasiResult | null>(null)

  const { data: provinsiList } = useProvinsiList()
  const { data: kabupatenList } = useKabupatenList(provinsiCode)
  const { data: kecamatanList } = useKecamatanList(kabupatenCode)
  const { data: kelurahanList } = useKelurahanList(kecamatanCode)
  const { data: kabupatenNasionalList } = useKabupatenNasionalList()
  const deteksiLokasi = useDeteksiLokasi()

  const provinsiItems = mergeWilayahItems(provinsiList, deteksiResult?.provinsi)
  const kabupatenItems = mergeWilayahItems(kabupatenList, deteksiResult?.kabupaten)
  const kecamatanItems = mergeWilayahItems(kecamatanList, deteksiResult?.kecamatan)
  const kelurahanItems = mergeWilayahItems(kelurahanList, deteksiResult?.kelurahan)

  function applyDeteksiResult(result: DeteksiLokasiResult) {
    setDeteksiResult(result)
    setProvinsiCode(result.provinsi?.code ?? '')
    setKabupatenCode(result.kabupaten?.code ?? '')
    setKecamatanCode(result.kecamatan?.code ?? '')
    setKelurahanCode(result.kelurahan?.code ?? '')
  }

  // Auto-trigger saat dialog terbuka — komponen di-remount tiap kali
  // tombol "Verifikasi" diklik (via `key` prop di PasienListPage).
  const { mutate: triggerDeteksiLokasi } = deteksiLokasi
  useEffect(() => {
    triggerDeteksiLokasi(undefined, { onSuccess: applyDeteksiResult })
  }, [triggerDeteksiLokasi])

  const [step, setStep] = useState<Step>('data-lengkap')
  const [maxStepIndex, setMaxStepIndex] = useState(0)
  const stepIndex = STEPS.indexOf(step)

  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [cropSource, setCropSource] = useState<{ src: string; fileName: string; mimeType: string } | null>(null)
  const [tempatLahirCode, setTempatLahirCode] = useState('')
  const tempatLahirItems = mergeWilayahItems(kabupatenNasionalList, null)
  const [golonganDarahId, setGolonganDarahId] = useState('')
  const [nomorTelepon, setNomorTelepon] = useState('')
  const [alamat, setAlamat] = useState('')
  const [errors, setErrors] = useState<StepErrors>({})

  const [bpjsNomor, setBpjsNomor] = useState('')
  const [bpjsJenisPeserta, setBpjsJenisPeserta] = useState('')
  const [bpjsKelas, setBpjsKelas] = useState('')
  const [bpjsNamaFasyankes, setBpjsNamaFasyankes] = useState('')
  const [bpjsKodeFasyankes, setBpjsKodeFasyankes] = useState('')
  const [bpjsMasaBerlaku, setBpjsMasaBerlaku] = useState('')

  const [asuransiEntries, setAsuransiEntries] = useState<AsuransiEntry[]>([])

  const [submitError, setSubmitError] = useState<string | undefined>()

  const selectedTempatLahirItem = findComboboxOption(tempatLahirItems, tempatLahirCode)
  const selectedGolonganDarahItem = findComboboxOption(golonganDarahItems, golonganDarahId)
  const selectedProvinsiItem = findComboboxOption(provinsiItems, provinsiCode)
  const selectedKabupatenItem = findComboboxOption(kabupatenItems, kabupatenCode)
  const selectedKecamatanItem = findComboboxOption(kecamatanItems, kecamatanCode)
  const selectedKelurahanItem = findComboboxOption(kelurahanItems, kelurahanCode)

  function goToStep(target: Step) {
    const targetIndex = STEPS.indexOf(target)
    if (targetIndex <= maxStepIndex) setStep(target)
  }

  function handleFotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    event.target.value = ''
    if (!file) return

    setCropSource({ src: URL.createObjectURL(file), fileName: file.name, mimeType: file.type })
  }

  function handleCropCancel() {
    if (cropSource) URL.revokeObjectURL(cropSource.src)
    setCropSource(null)
  }

  function handleCropped(croppedFile: File) {
    if (cropSource) URL.revokeObjectURL(cropSource.src)
    setCropSource(null)

    setFoto(croppedFile)
    setErrors((prev) => ({ ...prev, foto: undefined }))
    setFotoPreview(URL.createObjectURL(croppedFile))
  }

  function addAsuransiEntry() {
    setAsuransiEntries((prev) => [...prev, createEmptyAsuransiEntry()])
  }

  function updateAsuransiEntry(tempId: string, patch: Partial<AsuransiEntry>) {
    setAsuransiEntries((prev) => prev.map((entry) => (entry.tempId === tempId ? { ...entry, ...patch } : entry)))
  }

  function removeAsuransiEntry(tempId: string) {
    setAsuransiEntries((prev) => prev.filter((entry) => entry.tempId !== tempId))
  }

  function validateDataLengkap(): boolean {
    const nextErrors: StepErrors = {}
    if (!foto) nextErrors.foto = 'Foto wajib diunggah.'
    if (!tempatLahirCode) nextErrors.tempat_lahir = 'Tempat lahir wajib dipilih.'
    if (!golonganDarahId) nextErrors.golongan_darah_id = 'Golongan darah wajib dipilih.'
    if (!nomorTelepon.trim()) nextErrors.nomor_telepon = 'Nomor telepon wajib diisi.'
    if (!alamat.trim()) nextErrors.alamat = 'Alamat wajib diisi.'

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function goToNextStep() {
    if (step === 'data-lengkap') {
      if (!validateDataLengkap()) return
      setMaxStepIndex((prev) => Math.max(prev, 1))
      setStep('bpjs')
    } else if (step === 'bpjs') {
      setMaxStepIndex((prev) => Math.max(prev, 2))
      setStep('asuransi')
    }
  }

  function handleSubmit() {
    if (!pasien || !validateDataLengkap() || !foto) {
      setStep('data-lengkap')
      return
    }

    setSubmitError(undefined)

    const tempatLahirNama =
      kabupatenNasionalList?.find((item) => item.code === tempatLahirCode)?.name ?? tempatLahirCode

    verify
      .mutateAsync({
        id: pasien.id,
        payload: {
          foto,
          tempat_lahir: tempatLahirNama,
          golongan_darah_id: Number(golonganDarahId),
          nomor_telepon: nomorTelepon,
          alamat,
          provinsi_code: provinsiCode || undefined,
          kabupaten_code: kabupatenCode || undefined,
          kecamatan_code: kecamatanCode || undefined,
          kelurahan_code: kelurahanCode || undefined,
          bpjs_nomor: bpjsNomor || undefined,
          bpjs_jenis_peserta: bpjsJenisPeserta || undefined,
          bpjs_kelas: bpjsKelas || undefined,
          bpjs_nama_fasyankes: bpjsNamaFasyankes || undefined,
          bpjs_kode_fasyankes: bpjsKodeFasyankes || undefined,
          bpjs_masa_berlaku: bpjsMasaBerlaku || undefined,
          asuransi: asuransiEntries
            .filter((entry) => entry.asuransiId !== '')
            .map((entry) => ({
              asuransi_id: Number(entry.asuransiId),
              nomor_polis: entry.nomorPolis || undefined,
              masa_berlaku: entry.masaBerlaku || undefined,
            })),
        },
      })
      .then(() => onOpenChange(false))
      .catch((error: unknown) => {
        setSubmitError(
          isAxiosError(error)
            ? ((error.response?.data?.message as string | undefined) ?? 'Gagal memverifikasi pasien.')
            : 'Gagal memverifikasi pasien.',
        )
      })
  }

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-5xl">
        <DialogHeader className="shrink-0">
          <DialogTitle>Verifikasi Pasien</DialogTitle>
          <DialogDescription>
            {pasien?.nama} &middot; NIK {pasien?.nik}
          </DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 items-center">
          {STEPS.map((s, index) => {
            const isActive = s === step
            const isCompleted = index < stepIndex
            const isClickable = index <= maxStepIndex

            return (
              <Fragment key={s}>
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => goToStep(s)}
                  className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                      isCompleted && 'border-primary bg-primary text-primary-foreground',
                      isActive && !isCompleted && 'border-primary text-primary',
                      !isActive && !isCompleted && 'border-border text-muted-foreground',
                    )}
                  >
                    {isCompleted ? <CheckIcon className="size-4" /> : index + 1}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-medium whitespace-nowrap',
                      isActive ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {STEP_META[s].label}
                  </span>
                  <span className="text-muted-foreground text-[11px]">{STEP_META[s].description}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-px flex-1 self-start mt-4',
                      index < maxStepIndex ? 'bg-primary' : 'bg-border',
                    )}
                  />
                )}
              </Fragment>
            )
          })}
        </div>

        <div className="min-h-[26rem] flex-1 overflow-y-auto -mx-1 px-1">
          {step === 'data-lengkap' && (
            <div className="grid gap-6 sm:grid-cols-[320px_1fr]">
              <div className="flex flex-col gap-4 sm:border-r sm:pr-6">
                <div
                  data-invalid={Boolean(errors.foto)}
                  className="group/field flex flex-col items-center gap-3 text-center data-[invalid=true]:text-destructive"
                >
                  <button
                    type="button"
                    onClick={() => fotoInputRef.current?.click()}
                    className="group relative mt-4 cursor-pointer rounded-full outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <Avatar className="size-45 ring-4 ring-border ring-offset-4 ring-offset-background shadow-sm">
                      {fotoPreview ? (
                        <AvatarImage src={fotoPreview} alt="Pratinjau foto pasien" />
                      ) : (
                        <AvatarFallback>
                          <UserRoundIcon className="size-18" />
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
                      <ImageUpIcon className="size-9" />
                    </span>
                  </button>
                  <label htmlFor="pasien-foto" className="sr-only">
                    Foto — klik untuk mengunggah
                  </label>
                  <input
                    ref={fotoInputRef}
                    id="pasien-foto"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFotoChange}
                  />
                  {errors.foto && <FieldError>{errors.foto}</FieldError>}
                </div>

                <Separator />

                <div className="flex flex-col gap-3">
                  <Field data-invalid={Boolean(errors.tempat_lahir)}>
                    <FieldLabel htmlFor="pasien-tempat-lahir">Tempat Lahir</FieldLabel>
                    <Combobox
                      items={tempatLahirItems}
                      value={selectedTempatLahirItem}
                      onValueChange={(item) => {
                        setTempatLahirCode(item?.value ?? '')
                        setErrors((prev) => ({ ...prev, tempat_lahir: undefined }))
                      }}
                      limit={50}
                    >
                      <ComboboxInput
                        id="pasien-tempat-lahir"
                        placeholder="Cari kabupaten/kota..."
                        aria-invalid={Boolean(errors.tempat_lahir)}
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
                    {errors.tempat_lahir && <FieldError>{errors.tempat_lahir}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="pasien-tanggal-lahir">Tanggal Lahir</FieldLabel>
                    <Input
                      id="pasien-tanggal-lahir"
                      type="text"
                      value={pasien?.tanggal_lahir ?? ''}
                      readOnly
                      disabled
                      className="disabled:opacity-100"
                    />
                  </Field>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">Informasi Tambahan</h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={Boolean(errors.golongan_darah_id)}>
                    <FieldLabel htmlFor="pasien-golongan-darah">Golongan Darah</FieldLabel>
                    <Combobox
                      items={golonganDarahItems}
                      value={selectedGolonganDarahItem}
                      onValueChange={(item) => {
                        setGolonganDarahId(item?.value ?? '')
                        setErrors((prev) => ({ ...prev, golongan_darah_id: undefined }))
                      }}
                    >
                      <ComboboxInput
                        id="pasien-golongan-darah"
                        placeholder="Cari golongan darah..."
                        aria-invalid={Boolean(errors.golongan_darah_id)}
                        className="w-full"
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: ComboboxOption) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                    {errors.golongan_darah_id && <FieldError>{errors.golongan_darah_id}</FieldError>}
                  </Field>

                  <Field data-invalid={Boolean(errors.nomor_telepon)}>
                    <FieldLabel htmlFor="pasien-nomor-telepon">Nomor Telepon</FieldLabel>
                    <Input
                      id="pasien-nomor-telepon"
                      value={nomorTelepon}
                      onChange={(e) => {
                        setNomorTelepon(e.target.value)
                        setErrors((prev) => ({ ...prev, nomor_telepon: undefined }))
                      }}
                    />
                    {errors.nomor_telepon && <FieldError>{errors.nomor_telepon}</FieldError>}
                  </Field>

                  {(deteksiLokasi.isPending || deteksiLokasi.isError || deteksiLokasi.isSuccess) && (
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                      {deteksiLokasi.isPending && (
                        <p className="text-muted-foreground text-xs">Mendeteksi lokasi saat ini...</p>
                      )}
                      {deteksiLokasi.isError && (
                        <p className="text-destructive text-xs">{deteksiLokasi.error.message}</p>
                      )}
                      {deteksiLokasi.isSuccess && deteksiLokasi.data.provinsi === null && (
                        <p className="text-muted-foreground text-xs">
                          Lokasi tidak dapat dicocokkan ke data wilayah, silakan pilih manual.
                        </p>
                      )}
                    </div>
                  )}

                  <Field>
                    <FieldLabel htmlFor="pasien-provinsi">Provinsi</FieldLabel>
                    <Combobox
                      items={provinsiItems}
                      value={selectedProvinsiItem}
                      onValueChange={(item) => {
                        setProvinsiCode(item?.value ?? '')
                        setKabupatenCode('')
                        setKecamatanCode('')
                        setKelurahanCode('')
                        setDeteksiResult(null)
                      }}
                    >
                      <ComboboxInput id="pasien-provinsi" placeholder="Cari provinsi..." className="w-full" />
                      <ComboboxContent>
                        <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: ComboboxOption) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="pasien-kabupaten">Kabupaten/Kota</FieldLabel>
                    <Combobox
                      items={kabupatenItems}
                      value={selectedKabupatenItem}
                      disabled={!provinsiCode}
                      onValueChange={(item) => {
                        setKabupatenCode(item?.value ?? '')
                        setKecamatanCode('')
                        setKelurahanCode('')
                        setDeteksiResult(null)
                      }}
                    >
                      <ComboboxInput
                        id="pasien-kabupaten"
                        placeholder="Cari kabupaten/kota..."
                        disabled={!provinsiCode}
                        className="w-full"
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: ComboboxOption) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="pasien-kecamatan">Kecamatan</FieldLabel>
                    <Combobox
                      items={kecamatanItems}
                      value={selectedKecamatanItem}
                      disabled={!kabupatenCode}
                      onValueChange={(item) => {
                        setKecamatanCode(item?.value ?? '')
                        setKelurahanCode('')
                        setDeteksiResult(null)
                      }}
                    >
                      <ComboboxInput
                        id="pasien-kecamatan"
                        placeholder="Cari kecamatan..."
                        disabled={!kabupatenCode}
                        className="w-full"
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: ComboboxOption) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="pasien-kelurahan">Kelurahan/Desa</FieldLabel>
                    <Combobox
                      items={kelurahanItems}
                      value={selectedKelurahanItem}
                      disabled={!kecamatanCode}
                      onValueChange={(item) => {
                        setKelurahanCode(item?.value ?? '')
                        setDeteksiResult(null)
                      }}
                    >
                      <ComboboxInput
                        id="pasien-kelurahan"
                        placeholder="Cari kelurahan/desa..."
                        disabled={!kecamatanCode}
                        className="w-full"
                      />
                      <ComboboxContent>
                        <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                        <ComboboxList>
                          {(item: ComboboxOption) => (
                            <ComboboxItem key={item.value} value={item}>
                              {item.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </Field>

                  <Field data-invalid={Boolean(errors.alamat)} className="sm:col-span-2">
                    <FieldLabel htmlFor="pasien-alamat">Alamat Lengkap (Jalan, RT/RW, dst.)</FieldLabel>
                    <Textarea
                      id="pasien-alamat"
                      value={alamat}
                      onChange={(e) => {
                        setAlamat(e.target.value)
                        setErrors((prev) => ({ ...prev, alamat: undefined }))
                      }}
                    />
                    {errors.alamat && <FieldError>{errors.alamat}</FieldError>}
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 'bpjs' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="bpjs-nomor">Nomor BPJS</FieldLabel>
                <Input id="bpjs-nomor" value={bpjsNomor} onChange={(e) => setBpjsNomor(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="bpjs-jenis-peserta">Jenis Peserta</FieldLabel>
                <Input
                  id="bpjs-jenis-peserta"
                  value={bpjsJenisPeserta}
                  onChange={(e) => setBpjsJenisPeserta(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="bpjs-kelas">Kelas</FieldLabel>
                <Input id="bpjs-kelas" value={bpjsKelas} onChange={(e) => setBpjsKelas(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="bpjs-masa-berlaku">Masa Berlaku</FieldLabel>
                <Input
                  id="bpjs-masa-berlaku"
                  type="date"
                  value={bpjsMasaBerlaku}
                  onChange={(e) => setBpjsMasaBerlaku(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="bpjs-fasyankes">Nama Fasyankes</FieldLabel>
                <Input
                  id="bpjs-fasyankes"
                  value={bpjsNamaFasyankes}
                  onChange={(e) => setBpjsNamaFasyankes(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="bpjs-kode-fasyankes">Kode Fasyankes</FieldLabel>
                <Input
                  id="bpjs-kode-fasyankes"
                  value={bpjsKodeFasyankes}
                  onChange={(e) => setBpjsKodeFasyankes(e.target.value)}
                />
              </Field>
            </div>
          )}

          {step === 'asuransi' && (
            <div className="flex flex-col gap-4">
              {asuransiEntries.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  Belum ada asuransi tambahan. Pasien boleh tidak punya asuransi swasta, atau tambahkan satu
                  per satu lewat tombol di bawah (bisa lebih dari satu).
                </p>
              )}

              {asuransiEntries.map((entry, index) => (
                <div key={entry.tempId} className="flex flex-col gap-3 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Asuransi #{index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeAsuransiEntry(entry.tempId)}
                    >
                      <XIcon />
                      <span className="sr-only">Hapus asuransi #{index + 1}</span>
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field className="sm:col-span-2">
                      <FieldLabel htmlFor={`asuransi-${entry.tempId}-id`}>Asuransi</FieldLabel>
                      <Combobox
                        items={asuransiSelectItems}
                        value={findComboboxOption(asuransiSelectItems, entry.asuransiId)}
                        onValueChange={(item) => updateAsuransiEntry(entry.tempId, { asuransiId: item?.value ?? '' })}
                      >
                        <ComboboxInput
                          id={`asuransi-${entry.tempId}-id`}
                          placeholder="Cari asuransi..."
                          className="w-full"
                        />
                        <ComboboxContent>
                          <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                          <ComboboxList>
                            {(item: ComboboxOption) => (
                              <ComboboxItem key={item.value} value={item}>
                                {item.label}
                              </ComboboxItem>
                            )}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`asuransi-${entry.tempId}-polis`}>Nomor Polis</FieldLabel>
                      <Input
                        id={`asuransi-${entry.tempId}-polis`}
                        value={entry.nomorPolis}
                        onChange={(e) => updateAsuransiEntry(entry.tempId, { nomorPolis: e.target.value })}
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`asuransi-${entry.tempId}-berlaku`}>Masa Berlaku</FieldLabel>
                      <Input
                        id={`asuransi-${entry.tempId}-berlaku`}
                        type="date"
                        value={entry.masaBerlaku}
                        onChange={(e) => updateAsuransiEntry(entry.tempId, { masaBerlaku: e.target.value })}
                      />
                    </Field>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addAsuransiEntry} className="self-start">
                <PlusIcon />
                Tambah Asuransi
              </Button>

              {submitError && (
                <Alert variant="destructive">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <div className="-mx-4 -mb-4 flex shrink-0 items-center justify-between rounded-b-xl border-t bg-muted/50 p-4">
          {step === 'data-lengkap' ? (
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={() => setStep(STEPS[stepIndex - 1])}>
              Kembali
            </Button>
          )}

          {step === 'asuransi' ? (
            <Button type="button" onClick={handleSubmit} disabled={verify.isPending}>
              {verify.isPending ? 'Menyimpan...' : 'Simpan & Verifikasi'}
            </Button>
          ) : (
            <Button type="button" onClick={goToNextStep}>
              Lanjut
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {cropSource && (
      <FotoCropDialog
        open
        imageSrc={cropSource.src}
        fileName={cropSource.fileName}
        mimeType={cropSource.mimeType}
        onCancel={handleCropCancel}
        onCropped={handleCropped}
      />
    )}
    </>
  )
}
