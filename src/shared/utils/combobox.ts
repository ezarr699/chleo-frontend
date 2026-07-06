/**
 * ============================================================
 * @module      shared
 * @layer       shared > util
 * @file        combobox.ts
 * @path        src/shared/utils/combobox.ts
 * @description Helper kecil dipakai bareng komponen `Combobox`
 *              (`src/shared/components/ui/combobox.tsx`, base-ui) di
 *              seluruh aplikasi — `value`/`onValueChange` Combobox bekerja
 *              dengan OBJEK item (`{value, label}`), bukan string id/code
 *              polos seperti `Select`, jadi controlled state (yang
 *              biasanya cuma menyimpan id/code) butuh cara balik cari
 *              objek item yang cocok untuk dijadikan `value` terkontrol.
 *              Bukan di `combobox.tsx` sendiri supaya file hasil generate
 *              shadcn itu tetap orisinal (aman di-`add --overwrite` ulang
 *              tanpa kehilangan helper ini).
 * @since       v1.0.0
 * ============================================================
 */

export interface ComboboxOption {
  value: string
  label: string
}

export function findComboboxOption(items: ComboboxOption[], value: string): ComboboxOption | null {
  return items.find((item) => item.value === value) ?? null
}
