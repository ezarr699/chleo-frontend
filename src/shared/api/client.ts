/**
 * ============================================================
 * @module      shared
 * @layer       shared > api
 * @file        client.ts
 * @path        src/shared/api/client.ts
 * @description Axios instance & interceptors untuk semua request API.
 *              `apiRootClient` dipakai khusus untuk endpoint di luar
 *              prefix /api/v1, seperti /sanctum/csrf-cookie. Origin
 *              backend diturunkan dari hostname saat ini (lihat
 *              resolveApiRootURL.ts) supaya otomatis mengikuti
 *              subdomain tenant aktif.
 *
 *              Interceptor `code: 'tenant_suspended'` (dikirim middleware
 *              EnsureTenantNotSuspended di chleo-backend) menangkap kondisi
 *              tenant ditangguhkan dari MANA PUN request itu dipicu (login,
 *              cek sesi, atau request data biasa), lalu mengalihkan ke
 *              halaman informasi khusus — bukan sekadar diam-diam logout
 *              seperti error 401/403 lainnya.
 * @since       v1.0.0
 * @ref         https://axios-http.com/docs/instance
 *              https://laravel.com/docs/13.x/sanctum#spa-authenticating
 * ============================================================
 */

import axios, { isAxiosError } from 'axios'
import { resolveApiRootURL } from './resolveApiRootURL'

const apiRootURL = resolveApiRootURL()
const apiBaseURL = `${apiRootURL}/api/v1`

function handleTenantSuspended(error: unknown) {
  if (
    isAxiosError(error) &&
    error.response?.status === 403 &&
    error.response.data?.code === 'tenant_suspended' &&
    window.location.pathname !== '/account-suspended'
  ) {
    window.location.assign('/account-suspended')
    return new Promise(() => {}) // tahan promise chain — navigasi penuh sedang berlangsung
  }

  return Promise.reject(error)
}

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true,
  withXSRFToken: true,
})
apiClient.interceptors.response.use((response) => response, handleTenantSuspended)

export const apiRootClient = axios.create({
  baseURL: apiRootURL,
  withCredentials: true,
  withXSRFToken: true,
})
apiRootClient.interceptors.response.use((response) => response, handleTenantSuspended)
