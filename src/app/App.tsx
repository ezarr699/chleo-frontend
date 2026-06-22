/**
 * ============================================================
 * @module      app
 * @layer       app
 * @file        App.tsx
 * @path        src/app/App.tsx
 * @description Root component aplikasi: providers + router.
 * @since       v1.0.0
 * ============================================================
 */

import { RouterProvider } from 'react-router'
import { Providers } from './providers'
import { router } from './router'

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
