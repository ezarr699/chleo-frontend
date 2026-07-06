/**
 * ============================================================
 * @module      pasien
 * @layer       util
 * @file        cropImage.ts
 * @path        src/features/pasien/utils/cropImage.ts
 * @description Merender area crop (dari react-easy-crop, dalam piksel
 *              gambar asli) ke `<canvas>` lalu meng-export hasilnya
 *              sebagai `File` baru — dipakai FotoCropDialog supaya file
 *              yang dikirim ke endpoint verifikasi sudah dalam bentuk
 *              hasil crop, bukan gambar mentah utuh.
 * @since       v1.0.0
 * @ref         https://github.com/ricardo-ch/react-easy-crop#croppedareapixels
 * ============================================================
 */

export interface CroppedAreaPixels {
  x: number
  y: number
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Gagal memuat gambar untuk di-crop.'))
    image.src = src
  })
}

export async function getCroppedImageFile(
  imageSrc: string,
  croppedAreaPixels: CroppedAreaPixels,
  fileName: string,
  mimeType: string,
): Promise<File> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = croppedAreaPixels.width
  canvas.height = croppedAreaPixels.height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Browser ini tidak mendukung pemrosesan crop gambar.')

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Gagal memproses hasil crop.'))
        return
      }
      resolve(new File([blob], fileName, { type: mimeType }))
    }, mimeType)
  })
}
