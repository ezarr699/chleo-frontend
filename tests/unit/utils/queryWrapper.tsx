/**
 * ============================================================
 * @layer       test > util
 * @file        queryWrapper.tsx
 * @path        tests/unit/utils/queryWrapper.tsx
 * @description Wrapper QueryClientProvider untuk renderHook di test.
 * @since       v1.0.0
 * ============================================================
 */

import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
