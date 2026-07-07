/**
 * ============================================================
 * @module      app
 * @layer       component
 * @file        PekerjaanPage.tsx
 * @path        src/app/pages/master-data/PekerjaanPage.tsx
 * @description Halaman data master Pekerjaan.
 * @since       v1.0.0
 * ============================================================
 */

import { MasterDataPage } from '@/features/master-data'

export function PekerjaanPage() {
  return <MasterDataPage resource="pekerjaan" label="Pekerjaan" />
}
