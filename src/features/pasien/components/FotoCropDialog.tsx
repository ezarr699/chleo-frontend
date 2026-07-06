/**
 * ============================================================
 * @module      pasien
 * @layer       component
 * @file        FotoCropDialog.tsx
 * @path        src/features/pasien/components/FotoCropDialog.tsx
 * @description Dialog crop foto pasien (area bulat, rasio 1:1) yang
 *              muncul begitu user memilih file lewat avatar upload di
 *              PasienVerificationDialog — belum ada file input lain yang
 *              langsung submit foto mentah, semua wajib lewat crop ini
 *              dulu. Pakai `react-easy-crop` (tidak ada primitive crop di
 *              shadcn/ui) untuk gesture geser+zoom, hasil akhirnya
 *              di-render ke `<canvas>` lewat `getCroppedImageFile` (lihat
 *              `../utils/cropImage`) supaya yang di-upload ke backend
 *              sudah berupa `File` hasil crop, bukan gambar utuh.
 *              `imageSrc` di-revoke (`URL.revokeObjectURL`) oleh
 *              PARENT (PasienVerificationDialog), bukan di sini, karena
 *              object URL yang sama juga dipakai buat generate hasil crop
 *              lewat `<canvas>` — revoke lebih awal bikin gambar gagal
 *              dimuat pertengahan proses.
 * @ui          shadcn/ui: Dialog, Slider, Button
 * @since       v1.0.0
 * @ref         https://github.com/ricardo-ch/react-easy-crop
 * ============================================================
 */

import { useState } from 'react'
import Cropper from 'react-easy-crop'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Slider } from '@/shared/components/ui/slider'
import { getCroppedImageFile } from '../utils/cropImage'
import type { CroppedAreaPixels } from '../utils/cropImage'

interface FotoCropDialogProps {
  open: boolean
  imageSrc: string
  fileName: string
  mimeType: string
  onCancel: () => void
  onCropped: (file: File) => void
}

export function FotoCropDialog({ open, imageSrc, fileName, mimeType, onCancel, onCropped }: FotoCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | undefined>()

  async function handleConfirm() {
    if (!croppedAreaPixels) return

    setIsProcessing(true)
    setError(undefined)

    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels, fileName, mimeType)
      onCropped(file)
    } catch {
      setError('Gagal memproses hasil crop, silakan coba lagi.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sesuaikan Foto</DialogTitle>
          <DialogDescription>Geser dan perbesar untuk mengatur area foto profil.</DialogDescription>
        </DialogHeader>

        <div className="relative h-72 w-full overflow-hidden rounded-md bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, areaPixels) => setCroppedAreaPixels(areaPixels)}
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-xs">Zoom</span>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.05}
            onValueChange={(value) => setZoom(Array.isArray(value) ? value[0] : value)}
          />
        </div>

        {error && <p className="text-destructive text-xs">{error}</p>}

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Batal
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isProcessing || !croppedAreaPixels}>
            {isProcessing ? 'Memproses...' : 'Gunakan Foto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
