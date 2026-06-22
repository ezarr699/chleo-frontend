/**
 * ============================================================
 * @module      shared
 * @layer       shared > api
 * @file        resolveApiRootURL.ts
 * @path        src/shared/api/resolveApiRootURL.ts
 * @description Menentukan origin backend API berdasarkan hostname saat
 *              ini (multi-tenant subdomain). Frontend dan backend selalu
 *              berjalan di hostname yang sama (beda port), jadi
 *              acme.localhost:3000 -> http://acme.localhost:8000.
 * @since       v1.0.0
 * ============================================================
 */

const apiProtocol = import.meta.env.VITE_API_PROTOCOL ?? 'http'
const apiPort = import.meta.env.VITE_API_PORT ?? '8000'

export function resolveApiRootURL(hostname: string = window.location.hostname): string {
  return `${apiProtocol}://${hostname}:${apiPort}`
}
